import os
import re
import subprocess
import sys
import threading
import zipfile
from pathlib import Path

import customtkinter as ctk
from tkinter import filedialog, messagebox

from services.name_suggester import (
    DEFAULT_TEMPUS_PASSWORD,
    USERNAME_MODE_FIRSTNAME,
    USERNAME_MODE_FULLNAME,
    suggest_name_from_email,
    suggest_username_from_display_name,
)
from services.excel_parser import parse_excel_with_report
from services.outlook_service import create_batch_emails, parse_cc_addresses as _parse_cc_addresses
from services.preview_format import body_to_preview_text
from services.template_engine import DEFAULT_SUBJECT, PLACEHOLDERS, fill_subject, placeholder_token_map
from services.template_store import (
    EmailTemplate,
    copy_images_into_template,
    create_new_template_folder,
    create_new_template_from_docx,
    import_body_file_into_template,
    import_template_zip,
    list_templates,
    load_body_raw,
    prepare_body,
    save_template_bundle,
    templates_root,
)
from ui import TemplateAssistantWindow, WorkflowStrip


ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

ACCENT = "#2563EB"
ACCENT_HOVER = "#1D4ED8"
SUCCESS = "#16A34A"
DANGER = "#DC2626"
MUTED = "#475569"

TAB_DATA = "  1. Daten  "
TAB_PICK = "  2. Vorlage  "
TAB_EDIT = "  3. Bearbeiten  "
TAB_SEND = "  4. Senden  "
WORKFLOW_TAB_ORDER = (TAB_DATA, TAB_PICK, TAB_EDIT, TAB_SEND)
WORKFLOW_STEP_TITLES = ("Daten", "Vorlage", "Inhalt", "Senden")
WORKFLOW_HINTS = (
    "Empfänger: Excel importieren oder Zeilen anlegen. Globale URL, Initialpasswort und Username-Modus (nur Vorname vs. Vor- und Nachname) setzen.",
    "Welche E-Mail-Vorlage soll verwendet werden? Über „Vorlagen-Assistent“ legen Sie eine neue Vorlage ohne Finder an.",
    "Betreff und Text der Vorlage bearbeiten und speichern. Bei Word-Vorlagen den Body in Word öffnen und Platzhalter dort einfügen.",
    "Betreff prüfen, Vorschau lesen, dann alle Entwürfe in Outlook öffnen.",
)


class DataEntryRow(ctk.CTkFrame):
    """A single editable row in the data table."""

    def __init__(
        self,
        master,
        row_index: int,
        on_delete=None,
        on_email_change=None,
        on_name_change=None,
        **kwargs,
    ):
        super().__init__(master, fg_color="transparent", **kwargs)
        self.row_index = row_index
        self._on_delete = on_delete
        self._on_email_change = on_email_change
        self._on_name_change = on_name_change
        # Letzter automatisch abgeleiteter Username; wird gesetzt, wenn die App
        # den Username aus dem Namen berechnet. Dient als Heuristik: „Nutzer
        # hat manuell angepasst oder nicht?“
        self.last_auto_username: str = ""

        self.grid_columnconfigure((0, 1, 2, 3, 4), weight=1)
        self.grid_columnconfigure(5, weight=0)

        self.name_var = ctk.StringVar()
        self.email_var = ctk.StringVar()
        self.url_var = ctk.StringVar()
        self.username_var = ctk.StringVar()
        self.password_var = ctk.StringVar()

        field_opts = dict(height=32, corner_radius=6, border_width=1)

        self.name_entry = ctk.CTkEntry(self, textvariable=self.name_var, placeholder_text="Name", **field_opts)
        self.email_entry = ctk.CTkEntry(self, textvariable=self.email_var, placeholder_text="E-Mail", **field_opts)
        self.url_entry = ctk.CTkEntry(self, textvariable=self.url_var, placeholder_text="URL", **field_opts)
        self.username_entry = ctk.CTkEntry(self, textvariable=self.username_var, placeholder_text="Username", **field_opts)
        self.password_entry = ctk.CTkEntry(self, textvariable=self.password_var, placeholder_text="Password", **field_opts)

        self.name_entry.grid(row=0, column=0, padx=(0, 4), sticky="ew")
        self.email_entry.grid(row=0, column=1, padx=4, sticky="ew")
        self.url_entry.grid(row=0, column=2, padx=4, sticky="ew")
        self.username_entry.grid(row=0, column=3, padx=4, sticky="ew")
        self.password_entry.grid(row=0, column=4, padx=4, sticky="ew")

        del_btn = ctk.CTkButton(
            self, text="✕", width=32, height=32, corner_radius=6,
            fg_color=DANGER, hover_color="#B91C1C",
            command=self._delete,
        )
        del_btn.grid(row=0, column=5, padx=(4, 0))

        self.email_var.trace_add("write", self._email_changed)
        self.name_var.trace_add("write", self._name_changed)

    def _email_changed(self, *_):
        if self._on_email_change:
            self._on_email_change(self)

    def _name_changed(self, *_):
        if self._on_name_change:
            self._on_name_change(self)

    def _delete(self):
        if self._on_delete:
            self._on_delete(self)

    def get_data(self) -> dict[str, str]:
        return {
            "name": self.name_var.get().strip(),
            "email": self.email_var.get().strip(),
            "url": self.url_var.get().strip(),
            "username": self.username_var.get().strip(),
            "password": self.password_var.get().strip(),
        }

    def set_data(self, data: dict[str, str]):
        self.name_var.set(data.get("name", ""))
        self.email_var.set(data.get("email", ""))
        self.url_var.set(data.get("url", ""))
        self.username_var.set(data.get("username", ""))
        self.password_var.set(data.get("password", ""))


class App(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("Tempus Login Mailer")
        self.geometry("1100x720")
        self.minsize(900, 600)

        self._app_dir = Path(sys.executable).resolve().parent if getattr(sys, "frozen", False) else Path(__file__).resolve().parent
        self._display_to_tpl: dict[str, EmailTemplate] = {}
        self._current_tpl: EmailTemplate | None = None
        self._last_template_menu_label: str | None = None
        self._block_template_menu = False
        self._editor_dirty = False
        self._suppress_dirty = False

        self.data_rows: list[DataEntryRow] = []

        self._build_layout()
        self._reload_templates(initial=True)
        self.after(50, self._bring_window_forward)

    def _bring_window_forward(self) -> None:
        """Fenster sichtbar und nach vorne (besonders nach Start aus Skripten/IDE)."""
        self.update_idletasks()
        self.lift()
        try:
            self.attributes("-topmost", True)
            self.after(250, lambda: self.attributes("-topmost", False))
        except Exception:
            pass
        try:
            self.focus_force()
        except Exception:
            pass

    # ── Layout ────────────────────────────────────────────────────────

    def _build_layout(self):
        self.grid_rowconfigure(2, weight=1)
        self.grid_columnconfigure(0, weight=1)

        # Header
        header = ctk.CTkFrame(self, fg_color=ACCENT, corner_radius=0, height=56)
        header.grid(row=0, column=0, sticky="ew")
        header.grid_propagate(False)
        header.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(
            header, text="  Tempus Login Mailer", font=ctk.CTkFont(size=20, weight="bold"),
            text_color="white",
        ).grid(row=0, column=0, sticky="w", padx=20, pady=12)

        self._workflow_strip = WorkflowStrip(
            self,
            step_titles=WORKFLOW_STEP_TITLES,
            step_hints=WORKFLOW_HINTS,
            accent=ACCENT,
            accent_hover=ACCENT_HOVER,
            muted=MUTED,
            on_step=self._go_workflow_step,
            on_prev=self._workflow_prev,
            on_next=self._workflow_next,
        )
        self._workflow_strip.grid(row=1, column=0, sticky="ew", padx=16, pady=(8, 0))

        # Tabview
        self.tabs = ctk.CTkTabview(self, corner_radius=10, segmented_button_fg_color=ACCENT)
        self.tabs.grid(row=2, column=0, sticky="nsew", padx=16, pady=(8, 16))

        tab_data = self.tabs.add(TAB_DATA)
        tab_pick = self.tabs.add(TAB_PICK)
        tab_edit = self.tabs.add(TAB_EDIT)
        tab_send = self.tabs.add(TAB_SEND)

        self._build_data_tab(tab_data)
        self._build_template_pick_tab(tab_pick)
        self._build_template_edit_tab(tab_edit)
        self._build_send_tab(tab_send)

    def _workflow_tab_index(self) -> int:
        cur = self.tabs.get()
        try:
            return WORKFLOW_TAB_ORDER.index(cur)
        except ValueError:
            return 0

    def _go_workflow_step(self, idx: int) -> None:
        idx = max(0, min(idx, len(WORKFLOW_TAB_ORDER) - 1))
        target = WORKFLOW_TAB_ORDER[idx]
        self.tabs.set(target)
        self.update_idletasks()
        # Nach dem programmgesteuerten Tab-Wechsel setzen wir den Strip
        # direkt auf den Ziel-Index (nicht aus tabs.get() ableiten —
        # das kann in CustomTkinter noch den alten Wert liefern).
        self._workflow_strip.set_active(idx)
        if target == TAB_SEND:
            self._refresh_preview()

    def _workflow_prev(self) -> None:
        self._go_workflow_step(self._workflow_tab_index() - 1)

    def _workflow_next(self) -> None:
        self._go_workflow_step(self._workflow_tab_index() + 1)

    def _sync_workflow_strip_from_tabs(self) -> None:
        if hasattr(self, "_workflow_strip"):
            self._workflow_strip.set_active(self._workflow_tab_index())

    def _open_template_assistant(self) -> None:
        TemplateAssistantWindow(
            self,
            self._app_dir,
            accent=ACCENT,
            accent_hover=ACCENT_HOVER,
            on_created=self._after_template_assistant,
        )

    def _after_template_assistant(self, slug: str) -> None:
        self._reload_templates(initial=False)
        self._select_template_by_id(slug)

    def _select_template_by_id(self, slug: str) -> None:
        for lbl, t in self._display_to_tpl.items():
            if t.id == slug:
                self._block_template_menu = True
                self.template_menu.set(lbl)
                self._block_template_menu = False
                self._on_template_selected(lbl)
                self._go_workflow_step(2)
                break

    # ── Tab 1: Daten ─────────────────────────────────────────────────

    def _build_data_tab(self, parent):
        parent.grid_rowconfigure(6, weight=1)
        parent.grid_columnconfigure(0, weight=1)

        self.default_password_var = ctk.StringVar(value=DEFAULT_TEMPUS_PASSWORD)
        self.global_cc_var = ctk.StringVar()

        # Top action bar
        action_bar = ctk.CTkFrame(parent, fg_color="transparent")
        action_bar.grid(row=0, column=0, sticky="ew", pady=(0, 8))
        action_bar.grid_columnconfigure(2, weight=1)

        ctk.CTkButton(
            action_bar, text="📂  Excel importieren", command=self._import_excel,
            fg_color=ACCENT, hover_color=ACCENT_HOVER, corner_radius=8, height=36,
        ).grid(row=0, column=0, padx=(0, 8))

        ctk.CTkButton(
            action_bar, text="＋  Zeile hinzufügen", command=self._add_empty_row,
            fg_color="#374151", hover_color="#4B5563", corner_radius=8, height=36,
        ).grid(row=0, column=1, padx=(0, 8))

        ctk.CTkButton(
            action_bar, text="🗑  Alle löschen", command=self._clear_all_rows,
            fg_color=DANGER, hover_color="#B91C1C", corner_radius=8, height=36, width=120,
        ).grid(row=0, column=3)

        # Zentrale URL + Initialpasswort
        url_frame = ctk.CTkFrame(parent, fg_color="transparent")
        url_frame.grid(row=1, column=0, sticky="ew", pady=(0, 6))
        url_frame.grid_columnconfigure(1, weight=1)

        ctk.CTkLabel(url_frame, text="Globale URL (für alle):", font=ctk.CTkFont(size=13, weight="bold")).grid(
            row=0, column=0, padx=(0, 8), sticky="w"
        )
        self.global_url_var = ctk.StringVar()
        self._global_url_entry = ctk.CTkEntry(
            url_frame, textvariable=self.global_url_var,
            placeholder_text="z.B. https://tempus.example.com/login",
            height=32, corner_radius=6, border_width=1,
        )
        self._global_url_entry.grid(row=0, column=1, sticky="ew", padx=(0, 8))
        self._global_url_entry.bind("<FocusOut>", self._on_global_url_focus_out)
        ctk.CTkButton(
            url_frame, text="URL in alle Zeilen", command=self._apply_global_url_to_all_rows_force,
            fg_color=ACCENT, hover_color=ACCENT_HOVER, corner_radius=8, height=32, width=150,
        ).grid(row=0, column=2, sticky="e")

        # Globales CC (für alle Entwürfe; mehrere Adressen per Komma/Semikolon)
        cc_frame = ctk.CTkFrame(parent, fg_color="transparent")
        cc_frame.grid(row=2, column=0, sticky="ew", pady=(0, 6))
        cc_frame.grid_columnconfigure(1, weight=1)

        ctk.CTkLabel(
            cc_frame, text="CC (für alle Mails):", font=ctk.CTkFont(size=13, weight="bold"),
        ).grid(row=0, column=0, padx=(0, 8), sticky="w")
        ctk.CTkEntry(
            cc_frame, textvariable=self.global_cc_var,
            placeholder_text="z. B. team@firma.com, chef@firma.com  (optional, mehrere durch Komma)",
            height=32, corner_radius=6, border_width=1,
        ).grid(row=0, column=1, sticky="ew")

        pass_frame = ctk.CTkFrame(parent, fg_color="transparent")
        pass_frame.grid(row=3, column=0, sticky="ew", pady=(0, 8))
        pass_frame.grid_columnconfigure(1, weight=1)

        ctk.CTkLabel(
            pass_frame, text="Initialpasswort (neue / leere Passwort-Spalten):",
            font=ctk.CTkFont(size=13, weight="bold"),
        ).grid(row=0, column=0, padx=(0, 8), sticky="w")
        ctk.CTkEntry(
            pass_frame, textvariable=self.default_password_var,
            placeholder_text=DEFAULT_TEMPUS_PASSWORD,
            height=32, corner_radius=6, border_width=1,
        ).grid(row=0, column=1, sticky="ew")
        ctk.CTkButton(
            pass_frame, text="Passwörter setzen", command=self._apply_default_password_to_all_rows,
            fg_color="#374151", hover_color="#4B5563", corner_radius=8, height=32, width=150,
        ).grid(row=0, column=2, padx=(8, 0), sticky="e")

        # Username-Modus (für alle Zeilen)
        mode_frame = ctk.CTkFrame(parent, fg_color="#1E293B", corner_radius=8)
        mode_frame.grid(row=4, column=0, sticky="ew", pady=(0, 8))
        mode_frame.grid_columnconfigure(3, weight=1)

        self.username_mode_var = ctk.StringVar(value=USERNAME_MODE_FIRSTNAME)

        ctk.CTkLabel(
            mode_frame, text="Username aus Anzeigenamen:", font=ctk.CTkFont(size=13, weight="bold"),
        ).grid(row=0, column=0, padx=(12, 8), pady=8, sticky="w")

        ctk.CTkRadioButton(
            mode_frame, text="Nur Vorname", variable=self.username_mode_var, value=USERNAME_MODE_FIRSTNAME,
            command=self._apply_username_mode_to_all_rows, font=ctk.CTkFont(size=13),
        ).grid(row=0, column=1, padx=(0, 12), pady=8)

        ctk.CTkRadioButton(
            mode_frame, text="Vor- & Nachname (z. B. Max Mustermann)", variable=self.username_mode_var,
            value=USERNAME_MODE_FULLNAME, command=self._apply_username_mode_to_all_rows,
            font=ctk.CTkFont(size=13),
        ).grid(row=0, column=2, padx=(0, 12), pady=8)

        ctk.CTkButton(
            mode_frame, text="Usernames neu setzen", command=self._apply_username_mode_to_all_rows,
            fg_color="#374151", hover_color="#4B5563", corner_radius=8, height=32, width=170,
        ).grid(row=0, column=3, padx=(8, 12), pady=8, sticky="e")

        # Column headers
        header_frame = ctk.CTkFrame(parent, fg_color="#1E293B", corner_radius=8, height=34)
        header_frame.grid(row=5, column=0, sticky="ew", pady=(0, 4))
        header_frame.grid_propagate(False)
        header_frame.grid_columnconfigure((0, 1, 2, 3, 4), weight=1)
        header_frame.grid_columnconfigure(5, weight=0)

        headers = ["Name", "E-Mail", "URL", "Username", "Password", ""]
        for i, h in enumerate(headers):
            ctk.CTkLabel(
                header_frame, text=h, font=ctk.CTkFont(size=12, weight="bold"),
                text_color="#94A3B8",
            ).grid(row=0, column=i, padx=8, pady=4, sticky="w")

        # Scrollable rows area
        self.rows_frame = ctk.CTkScrollableFrame(parent, fg_color="transparent", corner_radius=8)
        self.rows_frame.grid(row=6, column=0, sticky="nsew")
        self.rows_frame.grid_columnconfigure(0, weight=1)

        # Row counter
        self.row_counter_label = ctk.CTkLabel(
            parent, text="0 Einträge", font=ctk.CTkFont(size=12), text_color="#64748B"
        )
        self.row_counter_label.grid(row=7, column=0, sticky="w", pady=(4, 0))

    def _add_row(self, data: dict[str, str] | None = None) -> DataEntryRow:
        row = DataEntryRow(
            self.rows_frame,
            row_index=len(self.data_rows),
            on_delete=self._delete_row,
            on_email_change=self._on_email_changed,
            on_name_change=self._on_name_changed,
        )
        row.pack(fill="x", pady=2)
        self.data_rows.append(row)

        if data:
            # Apply global URL if row URL is empty
            if not data.get("url") and self.global_url_var.get().strip():
                data["url"] = self.global_url_var.get().strip()
            if not (data.get("password") or "").strip():
                data["password"] = self._get_default_password()
            name = (data.get("name") or "").strip()
            if not (data.get("username") or "").strip() and name:
                mode = self.username_mode_var.get()
                data["username"] = suggest_username_from_display_name(name, mode)
            row.set_data(data)
            # Merken, dass der Username automatisch abgeleitet wurde, damit
            # eine spätere Namensänderung ihn nachziehen darf.
            row.last_auto_username = data.get("username", "").strip()

        self._update_counter()
        return row

    def _add_empty_row(self):
        row = self._add_row()
        row.password_var.set(self._get_default_password())
        if self.global_url_var.get().strip():
            row.url_var.set(self.global_url_var.get().strip())

    def _delete_row(self, row: DataEntryRow):
        row.pack_forget()
        row.destroy()
        self.data_rows.remove(row)
        self._update_counter()

    def _clear_all_rows(self):
        if not self.data_rows:
            return
        if not messagebox.askyesno("Bestätigung", "Alle Einträge löschen?"):
            return
        for row in list(self.data_rows):
            row.pack_forget()
            row.destroy()
        self.data_rows.clear()
        self._update_counter()

    def _update_counter(self):
        n = len(self.data_rows)
        self.row_counter_label.configure(text=f"{n} {'Eintrag' if n == 1 else 'Einträge'}")

    def _get_default_password(self) -> str:
        p = self.default_password_var.get().strip()
        return p if p else DEFAULT_TEMPUS_PASSWORD

    def _on_global_url_focus_out(self, _event=None):
        self._apply_global_url_to_empty_rows()

    def _apply_global_url_to_empty_rows(self):
        g = self.global_url_var.get().strip()
        if not g or not self.data_rows:
            return
        for row in self.data_rows:
            if not row.url_var.get().strip():
                row.url_var.set(g)

    def _apply_global_url_to_all_rows_force(self):
        g = self.global_url_var.get().strip()
        if not g:
            messagebox.showwarning("URL", "Bitte zuerst eine globale URL eingeben.")
            return
        if not self.data_rows:
            messagebox.showinfo("URL", "Keine Zeilen vorhanden.")
            return
        nonempty = [r for r in self.data_rows if r.url_var.get().strip()]
        overwrite_all = True
        if nonempty:
            r = messagebox.askyesnocancel(
                "URLs übernehmen",
                "Einige Zeilen haben bereits eine URL.\n\n"
                "Ja = alle mit der globalen URL überschreiben\n"
                "Nein = nur leere URL-Zellen füllen\n"
                "Abbrechen = nichts tun",
            )
            if r is None:
                return
            overwrite_all = r is True
        for row in self.data_rows:
            if overwrite_all or not row.url_var.get().strip():
                row.url_var.set(g)

    def _apply_default_password_to_all_rows(self):
        pw = self._get_default_password()
        if not self.data_rows:
            messagebox.showinfo("Passwort", "Keine Zeilen vorhanden.")
            return
        if not messagebox.askyesno(
            "Passwörter",
            "Alle Passwort-Zellen mit dem Initialpasswort überschreiben?",
        ):
            return
        for row in self.data_rows:
            row.password_var.set(pw)

    def _apply_username_mode_to_all_rows(self):
        mode = self.username_mode_var.get()
        for row in self.data_rows:
            name = row.name_var.get().strip()
            if name:
                row.username_var.set(suggest_username_from_display_name(name, mode))

    def _on_email_changed(self, row: DataEntryRow):
        email = row.email_var.get().strip()
        if email and "@" in email and not row.name_var.get().strip():
            suggested = suggest_name_from_email(email)
            row.name_var.set(suggested)
        name = row.name_var.get().strip()
        if name and not row.username_var.get().strip():
            mode = self.username_mode_var.get()
            derived = suggest_username_from_display_name(name, mode)
            row.username_var.set(derived)
            row.last_auto_username = derived
        if not row.password_var.get().strip():
            row.password_var.set(self._get_default_password())

    def _on_name_changed(self, row: DataEntryRow):
        """Name geändert → Username mitziehen, wenn er nicht manuell abweicht."""
        name = row.name_var.get().strip()
        if not name:
            return
        mode = self.username_mode_var.get()
        new_auto = suggest_username_from_display_name(name, mode)
        current = row.username_var.get().strip()
        if not current or current == row.last_auto_username:
            if current != new_auto:
                row.username_var.set(new_auto)
            row.last_auto_username = new_auto

    def _import_excel(self):
        path = filedialog.askopenfilename(
            title="Excel-Datei auswählen",
            filetypes=[("Excel", "*.xlsx *.xls"), ("Alle Dateien", "*.*")],
        )
        if not path:
            return

        try:
            entries, report = parse_excel_with_report(path)
        except Exception as e:
            messagebox.showerror("Fehler", f"Excel konnte nicht gelesen werden:\n{e}")
            return

        if not entries:
            messagebox.showinfo(
                "Info",
                "Keine Zeilen in der Excel-Datei gefunden.\n\n"
                + report.human_summary(),
            )
            return

        mode = self.username_mode_var.get()
        for entry in entries:
            if not entry.get("name") and entry.get("email"):
                entry["name"] = suggest_name_from_email(entry["email"])
            if not (entry.get("password") or "").strip():
                entry["password"] = self._get_default_password()
            name = (entry.get("name") or "").strip()
            # Usernamen immer aus dem Anzeigenamen ableiten (Vorname / Vor+Nach laut Modus),
            # nicht aus einer oft falschen Excel-Spalte „Benutzername“.
            if name:
                entry["username"] = suggest_username_from_display_name(name, mode)
            self._add_row(entry)

        total = len(entries)
        without = report.total_without_email
        with_mail = total - without
        header = (
            f"{total} Zeilen importiert  ·  {with_mail} mit E-Mail"
            + (f"  ·  {without} ohne E-Mail (bitte in der Tabelle ergänzen)" if without else "")
        )
        messagebox.showinfo(
            "Excel-Import – Bericht",
            header + "\n\n" + report.human_summary(),
        )

    # ── Tab 2: Vorlage wählen / Tab 3: Bearbeiten ────────────────────

    def _tpl_menu_label(self, tpl: EmailTemplate) -> str:
        return f"{tpl.title}  [{tpl.id}]"

    def _open_templates_dir(self):
        root = templates_root(self._app_dir)
        root.mkdir(parents=True, exist_ok=True)
        if sys.platform == "darwin":
            subprocess.run(["open", str(root)], check=False)
        elif sys.platform == "win32":
            os.startfile(str(root))  # type: ignore[attr-defined]
        else:
            subprocess.run(["xdg-open", str(root)], check=False)

    def _reload_templates(self, initial: bool = False):
        if not initial and self._editor_dirty:
            if not messagebox.askyesno(
                "Neu laden",
                "Im Editor gibt es ungespeicherte Änderungen.\nTrotzdem die Vorlagenliste neu laden?",
            ):
                return
            self._editor_dirty = False

        tpls = list_templates(self._app_dir)
        self._display_to_tpl = {self._tpl_menu_label(t): t for t in tpls}

        labels = list(self._display_to_tpl.keys())
        self.template_menu.configure(values=labels if labels else ["— keine Vorlagen —"])

        if not tpls:
            self._current_tpl = None
            self._last_template_menu_label = None
            self.template_menu.set("— keine Vorlagen —")
            self.template_path_label.configure(
                text=f"Ordner: {templates_root(self._app_dir)}\n"
                "Lege Unterordner mit template.json und body.html, body.txt oder body.docx an (siehe templates/README.md).",
                text_color="#F87171",
            )
            self.subject_var.set(DEFAULT_SUBJECT)
            self.template_title_var.set("")
            self._load_body_editor_from_disk()
            if not initial:
                messagebox.showinfo("Vorlagen", "Keine Vorlagen gefunden. Ordner wurde ggf. angelegt — siehe README im Ordner „templates“.")
            return

        preferred = labels[0]
        if self._current_tpl:
            for lbl, t in self._display_to_tpl.items():
                if t.id == self._current_tpl.id:
                    preferred = lbl
                    break

        self.template_menu.set(preferred)
        self._on_template_selected(preferred)

    def _on_template_selected(self, choice: str):
        if self._block_template_menu:
            return
        tpl = self._display_to_tpl.get(choice)
        if not tpl:
            return
        if self._editor_dirty and self._current_tpl and tpl.id != self._current_tpl.id:
            if not messagebox.askyesno(
                "Ungespeichert",
                "Im Tab „Bearbeiten“ gibt es Änderungen, die noch nicht gespeichert sind.\n"
                "Trotzdem die Vorlage wechseln? (Änderungen gehen verloren.)",
            ):
                self._block_template_menu = True
                if self._last_template_menu_label:
                    self.template_menu.set(self._last_template_menu_label)
                self._block_template_menu = False
                return
            self._editor_dirty = False

        self._apply_template_choice(tpl, choice)

    def _apply_template_choice(self, tpl: EmailTemplate, menu_label: str | None = None):
        self._current_tpl = tpl
        self._last_template_menu_label = menu_label or self._tpl_menu_label(tpl)
        self._suppress_dirty = True
        try:
            self.subject_var.set(tpl.subject)
            self.template_title_var.set(tpl.title)
        finally:
            self._suppress_dirty = False
        root = templates_root(self._app_dir)
        fmt = "Word (.docx)" if tpl.is_docx else ("HTML" if tpl.body_path.suffix.lower() in (".html", ".htm") else "Text")
        self.template_path_label.configure(
            text=f"Ordner: {root / tpl.id}\nDatei: {tpl.body_path.name}  ({fmt})",
            text_color="#94A3B8",
        )
        self._sync_edit_tab_for_template(tpl)
        self._load_body_editor_from_disk()

    def _mono_font(self) -> ctk.CTkFont:
        fam = "Consolas" if sys.platform == "win32" else "Menlo"
        return ctk.CTkFont(family=fam, size=12)

    def _refresh_current_tpl_from_disk(self) -> None:
        if not self._current_tpl:
            return
        tid = self._current_tpl.id
        for t in list_templates(self._app_dir):
            if t.id == tid:
                self._current_tpl = t
                return

    def _sync_edit_tab_for_template(self, tpl: EmailTemplate):
        """DOCX: kein Bilder-HTML-Snippet; Hinweis-Label."""
        if not hasattr(self, "template_body_text"):
            return
        if tpl.is_docx:
            self._body_format_label.configure(text="Word-Vorlage (Platzhalter in Word einfügen):")
            self._btn_import_images.configure(state="disabled")
            self._btn_open_word_doc.configure(state="normal")
        else:
            self._body_format_label.configure(text="E-Mail-Text (body.html / body.txt):")
            self._btn_import_images.configure(state="normal")
            self._btn_open_word_doc.configure(state="disabled")

    def _on_body_editor_key(self, _evt=None):
        if self._current_tpl and self._current_tpl.is_docx:
            return
        self._mark_editor_dirty()

    def _load_body_editor_from_disk(self):
        if not hasattr(self, "template_body_text"):
            return
        if not self._current_tpl:
            self.template_body_text.configure(state="normal")
            self.template_body_text.delete("1.0", "end")
            self._mark_editor_clean()
            return
        try:
            text = load_body_raw(self._current_tpl)
        except OSError as e:
            messagebox.showerror("Lesen", str(e))
            return
        self.template_body_text.configure(state="normal")
        self.template_body_text.delete("1.0", "end")
        self.template_body_text.insert("1.0", text)
        if self._current_tpl.is_docx:
            self.template_body_text.configure(state="disabled")
        self._mark_editor_clean()

    def _copy_placeholder_list(self):
        lines = "\n".join(PLACEHOLDERS.keys())
        self.clipboard_clear()
        self.clipboard_append(lines)
        messagebox.showinfo("Zwischenablage", "Platzhalterzeilen wurden kopiert.\nIn Word einfügen und an die passende Stelle setzen.")

    def _open_body_docx_externally(self):
        if not self._current_tpl or not self._current_tpl.is_docx:
            return
        p = str(self._current_tpl.body_path.resolve())
        try:
            if sys.platform == "darwin":
                subprocess.run(["open", p], check=False)
            elif sys.platform == "win32":
                os.startfile(p)  # type: ignore[attr-defined]
            else:
                messagebox.showinfo("Word", f"Bitte manuell öffnen:\n{p}")
        except OSError as e:
            messagebox.showerror("Öffnen", str(e))

    def _mark_editor_dirty(self, *_):
        if self._suppress_dirty:
            return
        self._editor_dirty = True

    def _mark_editor_clean(self):
        self._editor_dirty = False

    def _save_template_from_editor(self):
        if not self._current_tpl:
            messagebox.showwarning("Vorlage", "Bitte zuerst in „2. Vorlage“ eine Vorlage auswählen.")
            return
        body = self.template_body_text.get("1.0", "end").rstrip("\n")
        try:
            save_template_bundle(
                self._current_tpl,
                title=self.template_title_var.get(),
                subject=self.subject_var.get(),
                body=body,
            )
        except OSError as e:
            messagebox.showerror("Speichern", str(e))
            return
        self._mark_editor_clean()
        self._reload_templates(initial=False)
        messagebox.showinfo("Gespeichert", "Vorlage wurde auf die Festplatte geschrieben.")

    def _discard_editor_changes(self):
        if not self._current_tpl:
            return
        if self._editor_dirty and not messagebox.askyesno("Zurücksetzen", "Alle ungespeicherten Änderungen verwerfen?"):
            return
        self._load_body_editor_from_disk()
        if self._current_tpl:
            self._suppress_dirty = True
            try:
                self.subject_var.set(self._current_tpl.subject)
                self.template_title_var.set(self._current_tpl.title)
            finally:
                self._suppress_dirty = False
        self._mark_editor_clean()

    def _import_body_from_file(self):
        if not self._current_tpl:
            messagebox.showwarning("Vorlage", "Bitte zuerst in „2. Vorlage“ eine Vorlage auswählen.")
            return
        path = filedialog.askopenfilename(
            title="HTML-, Text- oder Word-Datei wählen",
            filetypes=[
                ("Word", "*.docx"),
                ("HTML", "*.html *.htm"),
                ("Text", "*.txt"),
                ("Alle", "*.*"),
            ],
        )
        if not path:
            return
        try:
            import_body_file_into_template(self._current_tpl, Path(path))
        except OSError as e:
            messagebox.showerror("Import", str(e))
            return
        self._refresh_current_tpl_from_disk()
        self._load_body_editor_from_disk()
        self._suppress_dirty = True
        try:
            self.subject_var.set(self._current_tpl.subject)
            self.template_title_var.set(self._current_tpl.title)
        finally:
            self._suppress_dirty = False
        messagebox.showinfo("Import", "Dateiinhalt wurde in die Vorlagen-Datei übernommen.\n„Speichern“ schreibt Metadaten (Titel/Betreff) mit.")

    def _import_images_into_template(self):
        if not self._current_tpl:
            messagebox.showwarning("Vorlage", "Bitte zuerst in „2. Vorlage“ eine Vorlage auswählen.")
            return
        paths = filedialog.askopenfilenames(
            title="Bilder wählen (PNG, JPG, …)",
            filetypes=[("Bilder", "*.png *.jpg *.jpeg *.gif *.webp"), ("Alle", "*.*")],
        )
        if not paths:
            return
        try:
            rels = copy_images_into_template(self._current_tpl, [Path(p) for p in paths])
        except OSError as e:
            messagebox.showerror("Bilder", str(e))
            return
        if not rels:
            return
        insert = "\n".join(f'<p><img src="{r}" alt="" style="max-width:560px;" /></p>' for r in rels)
        self.template_body_text.insert("end", "\n" + insert + "\n")
        self._mark_editor_dirty()
        messagebox.showinfo(
            "Bilder",
            "Bilder wurden nach „bilder/“ kopiert und HTML-Snippets ans Ende eingefügt.\n"
            "Bitte Position im Text prüfen und „Speichern“ klicken.",
        )

    def _import_template_zip(self):
        zip_path = filedialog.askopenfilename(
            title="ZIP mit Vorlage wählen",
            filetypes=[("ZIP", "*.zip"), ("Alle", "*.*")],
        )
        if not zip_path:
            return
        dialog = ctk.CTkInputDialog(
            text="Ordnername unter „templates/“ (nur a–z, 0–9, _ und -):",
            title="Neue Vorlage aus ZIP",
        )
        slug = (dialog.get_input() or "").strip()
        if not slug or not re.match(r"^[a-zA-Z0-9_-]+$", slug):
            messagebox.showerror("Name", "Ungültiger Ordnername.")
            return
        try:
            import_template_zip(self._app_dir, Path(zip_path), slug)
        except FileExistsError:
            messagebox.showerror("ZIP", f"Der Ordner „{slug}“ existiert bereits.")
            return
        except (ValueError, OSError, zipfile.BadZipFile) as e:
            messagebox.showerror("ZIP", str(e))
            return
        self._reload_templates(initial=False)
        for lbl, t in self._display_to_tpl.items():
            if t.id == slug:
                self._block_template_menu = True
                self.template_menu.set(lbl)
                self._block_template_menu = False
                self._apply_template_choice(t, lbl)
                break
        messagebox.showinfo("ZIP", f"Vorlage wurde nach „templates/{slug}/“ entpackt.")

    def _new_template_dialog(self):
        dialog = ctk.CTkInputDialog(
            text="Technischer Ordnername (z.B. kunde_mueller_login):",
            title="Neue Vorlage",
        )
        slug = (dialog.get_input() or "").strip()
        if not slug or not re.match(r"^[a-zA-Z0-9_-]+$", slug):
            messagebox.showerror("Name", "Nur Buchstaben, Ziffern, Unterstrich und Bindestrich.")
            return
        try:
            create_new_template_folder(self._app_dir, slug)
        except FileExistsError:
            messagebox.showerror("Neu", f"Der Ordner „{slug}“ existiert bereits.")
            return
        except OSError as e:
            messagebox.showerror("Neu", str(e))
            return
        self._reload_templates(initial=False)
        for lbl, t in self._display_to_tpl.items():
            if t.id == slug:
                self._block_template_menu = True
                self.template_menu.set(lbl)
                self._block_template_menu = False
                self._apply_template_choice(t, lbl)
                break
        messagebox.showinfo("Neu", f"Vorlage „{slug}“ angelegt. In Tab 3 Text und Metadaten anpassen und speichern.")

    def _export_template_to_word(self):
        if not self._current_tpl:
            messagebox.showwarning("Vorlage", "Bitte zuerst in „2. Vorlage“ eine Vorlage auswählen.")
            return
        tpl = self._current_tpl
        initial = f"{tpl.id}.docx"
        path = filedialog.asksavefilename(
            title="Word-Datei speichern",
            defaultextension=".docx",
            filetypes=[("Word-Dokument", "*.docx"), ("Alle Dateien", "*.*")],
            initialfile=initial,
        )
        if not path:
            return
        try:
            if tpl.is_docx:
                from services.docx_template_io import export_docx_filled_copy

                entries = self._get_all_entries()
                first = entries[0] if entries else {}
                mapping = placeholder_token_map(
                    name=first.get("name", ""),
                    email=first.get("email", ""),
                    url=first.get("url", ""),
                    username=first.get("username", ""),
                    password=first.get("password", ""),
                )
                export_docx_filled_copy(tpl.body_path, Path(path), mapping)
            else:
                body = self.template_body_text.get("1.0", "end").rstrip("\n")
                if not body.strip():
                    messagebox.showwarning("Word", "Der Vorlagentext ist leer.")
                    return
                from services.docx_export import export_body_to_docx

                export_body_to_docx(
                    body=body,
                    is_html=tpl.body_path.suffix.lower() in (".html", ".htm"),
                    output_path=Path(path),
                    title=self.subject_var.get().strip()
                    or self.template_title_var.get().strip()
                    or tpl.title,
                    template_root=tpl.root,
                )
        except ImportError as e:
            messagebox.showerror(
                "Word-Export",
                "Paket fehlt. Im Projektordner ausführen:\npip3 install -r requirements.txt\n\n" + str(e),
            )
            return
        except Exception as e:
            messagebox.showerror("Word-Export", str(e))
            return
        messagebox.showinfo("Word", f"Gespeichert:\n{path}")

    def _new_template_from_word_file(self):
        path = filedialog.askopenfilename(
            title="Word-Vorlage (.docx) wählen",
            filetypes=[("Word", "*.docx"), ("Alle", "*.*")],
        )
        if not path:
            return
        dialog = ctk.CTkInputDialog(
            text="Ordnername unter „templates/“ (nur a–z, 0–9, _ und -):",
            title="Neue Vorlage aus Word",
        )
        slug = (dialog.get_input() or "").strip()
        if not slug or not re.match(r"^[a-zA-Z0-9_-]+$", slug):
            messagebox.showerror("Name", "Ungültiger Ordnername.")
            return
        try:
            create_new_template_from_docx(self._app_dir, slug, Path(path))
        except FileExistsError:
            messagebox.showerror("Word", f"Der Ordner „{slug}“ existiert bereits.")
            return
        except OSError as e:
            messagebox.showerror("Word", str(e))
            return
        self._reload_templates(initial=False)
        for lbl, t in self._display_to_tpl.items():
            if t.id == slug:
                self._block_template_menu = True
                self.template_menu.set(lbl)
                self._block_template_menu = False
                self._apply_template_choice(t, lbl)
                break
        messagebox.showinfo(
            "Word",
            f"Vorlage „{slug}“ wurde angelegt.\n"
            "Im Word-Dokument Platzhalter einfügen: {NAME} {EMAIL} {URL} {USERNAME} {PASSWORD}\n"
            "Tab „Bearbeiten“ → „Body in Word öffnen“ oder Ordner öffnen.",
        )

    def _build_template_pick_tab(self, parent):
        parent.grid_rowconfigure(5, weight=1)
        parent.grid_columnconfigure(0, weight=1)

        intro = (
            "Wähle die aktive Vorlage. Oben führt die Schrittleiste durch Daten → Vorlage → Inhalt → Senden. "
            "Mit „Vorlagen-Assistent“ erstellst du eine neue Vorlage vollständig in der Oberfläche (HTML oder Word)."
        )
        ctk.CTkLabel(
            parent, text=intro,
            font=ctk.CTkFont(size=12), text_color="#94A3B8",
            wraplength=900, justify="left",
        ).grid(row=0, column=0, sticky="w", pady=(0, 6))

        ph = "Platzhalter:  " + "   ".join(f"{k} = {v}" for k, v in PLACEHOLDERS.items())
        ctk.CTkLabel(
            parent, text=ph,
            font=ctk.CTkFont(size=12), text_color="#64748B",
            wraplength=900, justify="left",
        ).grid(row=1, column=0, sticky="w", pady=(0, 10))

        bar = ctk.CTkFrame(parent, fg_color="transparent")
        bar.grid(row=2, column=0, sticky="ew", pady=(0, 8))
        bar.grid_columnconfigure(5, weight=1)

        ctk.CTkLabel(bar, text="Vorlage:", font=ctk.CTkFont(size=13, weight="bold")).grid(
            row=0, column=0, padx=(0, 8)
        )
        self.template_menu = ctk.CTkOptionMenu(
            bar, values=["—"], command=self._on_template_selected,
            width=420, height=36, corner_radius=8, fg_color="#374151", button_color=ACCENT,
            button_hover_color=ACCENT_HOVER,
        )
        self.template_menu.grid(row=0, column=1, padx=(0, 8))

        ctk.CTkButton(
            bar, text="Ordner öffnen", command=self._open_templates_dir,
            fg_color=ACCENT, hover_color=ACCENT_HOVER, corner_radius=8, height=36, width=130,
        ).grid(row=0, column=2, padx=(0, 8))

        ctk.CTkButton(
            bar, text="Neu laden", command=lambda: self._reload_templates(initial=False),
            fg_color="#374151", hover_color="#4B5563", corner_radius=8, height=36, width=100,
        ).grid(row=0, column=3, padx=(0, 8), sticky="w")
        ctk.CTkButton(
            bar, text="Aus Word neu…", command=self._new_template_from_word_file,
            fg_color="#0D9488", hover_color="#0F766E", corner_radius=8, height=36, width=130,
        ).grid(row=0, column=4, sticky="w")

        asst_row = ctk.CTkFrame(parent, fg_color="transparent")
        asst_row.grid(row=3, column=0, sticky="ew", pady=(0, 8))
        ctk.CTkButton(
            asst_row,
            text="📝  Vorlagen-Assistent…",
            command=self._open_template_assistant,
            fg_color="#7C3AED",
            hover_color="#6D28D9",
            corner_radius=8,
            height=38,
            width=220,
            font=ctk.CTkFont(size=14, weight="bold"),
        ).pack(side="left", padx=(0, 10))

        self.template_path_label = ctk.CTkLabel(
            parent, text="", font=ctk.CTkFont(size=12),
            text_color="#94A3B8", anchor="w", justify="left",
        )
        self.template_path_label.grid(row=4, column=0, sticky="ew", pady=(0, 10))

        hint = (
            "Tipp: Tab „Bearbeiten“ — dort speicherst du Titel, Betreff und E-Mail-Text. "
            "Bilder: ZIP-Import oder „Bilder importieren“ legt Dateien unter bilder/ ab."
        )
        ctk.CTkLabel(
            parent, text=hint,
            font=ctk.CTkFont(size=11), text_color="#64748B",
            wraplength=900, justify="left",
        ).grid(row=5, column=0, sticky="nw", pady=(8, 0))

        self.subject_var = ctk.StringVar(value=DEFAULT_SUBJECT)
        self.template_title_var = ctk.StringVar(value="")

    def _build_template_edit_tab(self, parent):
        parent.grid_rowconfigure(3, weight=1)
        parent.grid_columnconfigure(0, weight=1)

        top = ctk.CTkFrame(parent, fg_color="transparent")
        top.grid(row=0, column=0, sticky="ew", pady=(0, 8))
        top.grid_columnconfigure(1, weight=1)

        ctk.CTkLabel(top, text="Anzeigetitel (template.json):", font=ctk.CTkFont(size=13, weight="bold")).grid(
            row=0, column=0, padx=(0, 8), sticky="w"
        )
        ctk.CTkEntry(
            top, textvariable=self.template_title_var,
            height=34, corner_radius=6, border_width=1, font=ctk.CTkFont(size=13),
        ).grid(row=0, column=1, sticky="ew")

        top2 = ctk.CTkFrame(parent, fg_color="transparent")
        top2.grid(row=1, column=0, sticky="ew", pady=(0, 8))
        top2.grid_columnconfigure(1, weight=1)

        ctk.CTkLabel(top2, text="Betreff:", font=ctk.CTkFont(size=13, weight="bold")).grid(
            row=0, column=0, padx=(0, 8), sticky="w"
        )
        ctk.CTkEntry(
            top2, textvariable=self.subject_var,
            height=34, corner_radius=6, border_width=1, font=ctk.CTkFont(size=13),
        ).grid(row=0, column=1, sticky="ew")

        self._body_format_label = ctk.CTkLabel(
            parent, text="E-Mail-Text (body.html / body.txt):",
            font=ctk.CTkFont(size=13, weight="bold"),
        )
        self._body_format_label.grid(row=2, column=0, sticky="w", pady=(0, 4))

        self.template_body_text = ctk.CTkTextbox(
            parent, corner_radius=8, border_width=1, font=self._mono_font(), wrap="none",
        )
        self.template_body_text.grid(row=3, column=0, sticky="nsew", pady=(0, 8))
        self.template_body_text.bind("<KeyRelease>", self._on_body_editor_key)

        btn_row = ctk.CTkFrame(parent, fg_color="transparent")
        btn_row.grid(row=4, column=0, sticky="ew")
        for i in range(10):
            btn_row.grid_columnconfigure(i, weight=0)
        btn_row.grid_columnconfigure(9, weight=1)

        ctk.CTkButton(
            btn_row, text="Speichern", command=self._save_template_from_editor,
            fg_color=SUCCESS, hover_color="#15803D", corner_radius=8, height=36, width=100,
        ).grid(row=0, column=0, padx=(0, 6))
        ctk.CTkButton(
            btn_row, text="Zurücksetzen", command=self._discard_editor_changes,
            fg_color="#374151", hover_color="#4B5563", corner_radius=8, height=36, width=110,
        ).grid(row=0, column=1, padx=(0, 6))
        ctk.CTkButton(
            btn_row, text="Datei importieren…", command=self._import_body_from_file,
            fg_color=ACCENT, hover_color=ACCENT_HOVER, corner_radius=8, height=36, width=140,
        ).grid(row=0, column=2, padx=(0, 6))
        self._btn_import_images = ctk.CTkButton(
            btn_row, text="Bilder importieren…", command=self._import_images_into_template,
            fg_color=ACCENT, hover_color=ACCENT_HOVER, corner_radius=8, height=36, width=150,
        )
        self._btn_import_images.grid(row=0, column=3, padx=(0, 6))
        ctk.CTkButton(
            btn_row, text="ZIP importieren…", command=self._import_template_zip,
            fg_color="#7C3AED", hover_color="#6D28D9", corner_radius=8, height=36, width=130,
        ).grid(row=0, column=4, padx=(0, 6))
        ctk.CTkButton(
            btn_row, text="Neue Vorlage…", command=self._new_template_dialog,
            fg_color="#0D9488", hover_color="#0F766E", corner_radius=8, height=36, width=130,
        ).grid(row=0, column=5, padx=(0, 6))
        ctk.CTkButton(
            btn_row, text="Als Word speichern…", command=self._export_template_to_word,
            fg_color="#B45309", hover_color="#92400E", corner_radius=8, height=36, width=150,
        ).grid(row=0, column=6, padx=(0, 6))
        ctk.CTkButton(
            btn_row, text="Platzhalter kopieren", command=self._copy_placeholder_list,
            fg_color="#475569", hover_color="#64748B", corner_radius=8, height=36, width=150,
        ).grid(row=0, column=7, padx=(0, 6))
        self._btn_open_word_doc = ctk.CTkButton(
            btn_row, text="Body in Word öffnen", command=self._open_body_docx_externally,
            fg_color="#475569", hover_color="#64748B", corner_radius=8, height=36, width=160,
            state="disabled",
        )
        self._btn_open_word_doc.grid(row=0, column=8, padx=(0, 6))

        asst_edit = ctk.CTkFrame(parent, fg_color="transparent")
        asst_edit.grid(row=5, column=0, sticky="w", pady=(6, 0))
        ctk.CTkButton(
            asst_edit,
            text="📝  Neuen Vorlagenordner mit Assistent…",
            command=self._open_template_assistant,
            fg_color="#7C3AED",
            hover_color="#6D28D9",
            corner_radius=8,
            height=34,
            width=280,
        ).pack(side="left")

        self.template_title_var.trace_add("write", self._mark_editor_dirty)
        self.subject_var.trace_add("write", self._mark_editor_dirty)

    # ── Tab 4: Senden ────────────────────────────────────────────────

    def _build_send_tab(self, parent):
        parent.grid_rowconfigure(4, weight=1)
        parent.grid_columnconfigure(0, weight=1)

        # Summary
        self.summary_frame = ctk.CTkFrame(parent, fg_color="#1E293B", corner_radius=10)
        self.summary_frame.grid(row=0, column=0, sticky="ew", pady=(0, 12))
        self.summary_frame.grid_columnconfigure(0, weight=1)

        self.summary_label = ctk.CTkLabel(
            self.summary_frame,
            text="Noch keine Einträge vorhanden.\nWechsle zu Tab 1 um Daten einzugeben.",
            font=ctk.CTkFont(size=14), text_color="#94A3B8",
            justify="left",
        )
        self.summary_label.grid(row=0, column=0, padx=20, pady=16, sticky="w")

        # Betreff (gleiche Variable wie Tab „Bearbeiten“; Speichern dort schreibt template.json)
        subj_row = ctk.CTkFrame(parent, fg_color="transparent")
        subj_row.grid(row=1, column=0, sticky="ew", pady=(0, 10))
        subj_row.grid_columnconfigure(1, weight=1)

        ctk.CTkLabel(subj_row, text="Betreff:", font=ctk.CTkFont(size=13, weight="bold")).grid(
            row=0, column=0, padx=(0, 10), sticky="w"
        )
        ctk.CTkEntry(
            subj_row,
            textvariable=self.subject_var,
            height=36,
            corner_radius=8,
            border_width=1,
            font=ctk.CTkFont(size=13),
            placeholder_text="z. B. Tempus Logins + Password Update Instructions",
        ).grid(row=0, column=1, sticky="ew")

        self.send_resolved_subject_label = ctk.CTkLabel(
            parent,
            text="",
            font=ctk.CTkFont(size=12),
            text_color="#94A3B8",
            wraplength=920,
            justify="left",
            anchor="w",
        )
        self.send_resolved_subject_label.grid(row=2, column=0, sticky="ew", pady=(0, 8))

        # Preview area
        ctk.CTkLabel(
            parent,
            text="Vorschau E-Mailtext (1. Empfänger, lesbar — Bilder als „[Bild]“):",
            font=ctk.CTkFont(size=13, weight="bold"),
        ).grid(row=3, column=0, sticky="w", pady=(0, 4))

        preview_font = ctk.CTkFont(size=13)
        self.preview_textbox = ctk.CTkTextbox(
            parent, corner_radius=8, border_width=1,
            font=preview_font,
            wrap="word", state="disabled",
        )
        self.preview_textbox.grid(row=4, column=0, sticky="nsew", pady=(0, 8))

        # Action buttons
        btn_frame = ctk.CTkFrame(parent, fg_color="transparent")
        btn_frame.grid(row=5, column=0, sticky="ew", pady=(4, 0))
        btn_frame.grid_columnconfigure(1, weight=1)

        ctk.CTkButton(
            btn_frame, text="🔄  Vorschau aktualisieren", command=self._refresh_preview,
            fg_color="#374151", hover_color="#4B5563", corner_radius=8, height=40,
        ).grid(row=0, column=0, padx=(0, 8))

        self.send_button = ctk.CTkButton(
            btn_frame, text="📧  E-Mails in Outlook öffnen", command=self._open_in_outlook,
            fg_color=SUCCESS, hover_color="#15803D", corner_radius=8, height=40,
            font=ctk.CTkFont(size=14, weight="bold"),
        )
        self.send_button.grid(row=0, column=2)

        # Progress
        self.progress_label = ctk.CTkLabel(
            parent, text="", font=ctk.CTkFont(size=12), text_color="#64748B"
        )
        self.progress_label.grid(row=6, column=0, sticky="w", pady=(4, 0))

        # Auto-refresh when tab is selected
        self.tabs.configure(command=self._on_tab_changed)
        self.subject_var.trace_add("write", self._update_send_tab_subject_hint)

    def _update_send_tab_subject_hint(self, *_):
        if not hasattr(self, "send_resolved_subject_label"):
            return
        if self.tabs.get() != TAB_SEND:
            return
        entries = self._get_all_entries()
        if not entries:
            self.send_resolved_subject_label.configure(text="")
            return
        first = entries[0]
        kw = {k: first.get(k, "") for k in ("name", "url", "username", "password", "email")}
        preview_subj = fill_subject(self.subject_var.get(), **kw)
        self.send_resolved_subject_label.configure(
            text=f"Betreff mit Daten der ersten Zeile: {preview_subj}",
        )

    def _on_tab_changed(self):
        self._sync_workflow_strip_from_tabs()
        if self.tabs.get() == TAB_SEND:
            self._refresh_preview()

    def _get_all_entries(self) -> list[dict[str, str]]:
        """Collect entries from all rows, applying global URL where needed."""
        entries = []
        global_url = self.global_url_var.get().strip()

        for row in self.data_rows:
            data = row.get_data()
            if not data["email"]:
                continue
            if not data["url"] and global_url:
                data["url"] = global_url
            entries.append(data)

        return entries

    def _refresh_preview(self):
        entries = self._get_all_entries()
        n = len(entries)

        if n == 0:
            self.summary_label.configure(
                text="Noch keine Einträge vorhanden.\nWechsle zu Tab 1 um Daten einzugeben.",
                text_color="#94A3B8",
            )
            self.send_resolved_subject_label.configure(text="")
            self.preview_textbox.configure(state="normal")
            self.preview_textbox.delete("1.0", "end")
            self.preview_textbox.configure(state="disabled")
            return

        recipients = ", ".join(e["email"] for e in entries)
        self.summary_label.configure(
            text=f"{n} E-Mail{'s' if n != 1 else ''} werden vorbereitet\n"
                 f"Empfänger: {recipients}",
            text_color="white",
        )

        if not self._current_tpl:
            self.send_resolved_subject_label.configure(text="")
            self.preview_textbox.configure(state="normal")
            self.preview_textbox.delete("1.0", "end")
            self.preview_textbox.insert("1.0", "Keine Vorlage geladen. Tab „2. Vorlage“ prüfen.")
            self.preview_textbox.configure(state="disabled")
            return

        subj_tpl = self.subject_var.get()
        first = entries[0]
        kw = {k: first.get(k, "") for k in ("name", "url", "username", "password", "email")}
        preview_subj = fill_subject(subj_tpl, **kw)
        self.send_resolved_subject_label.configure(
            text=f"Betreff mit Daten der ersten Zeile: {preview_subj}",
        )

        preview_body, is_html = prepare_body(self._current_tpl, **kw)
        body_plain = body_to_preview_text(preview_body, is_html=is_html)
        fmt_note = (
            "HTML mit Bildern — in Outlook wie gewohnt mit Grafiken."
            if is_html
            else "Reintext"
        )
        preview_text = (
            f"An: {first['email']}\n"
            f"Hinweis: {fmt_note}\n"
            f"{'─' * 50}\n"
            f"{body_plain}"
        )

        self.preview_textbox.configure(state="normal")
        self.preview_textbox.delete("1.0", "end")
        self.preview_textbox.insert("1.0", preview_text)
        self.preview_textbox.configure(state="disabled")

    def _open_in_outlook(self):
        entries = self._get_all_entries()
        if not entries:
            messagebox.showwarning("Keine Daten", "Bitte zuerst Einträge in Tab 1 eingeben.")
            return

        missing = [e["email"] for e in entries if not e["url"] or not e["username"] or not e["password"]]
        if missing:
            if not messagebox.askyesno(
                "Unvollständige Daten",
                f"Folgende Einträge haben fehlende Felder (URL/Username/Password):\n"
                f"{', '.join(missing)}\n\nTrotzdem fortfahren?"
            ):
                return

        # CC aus Schritt 1 (Daten) einlesen und validieren.
        cc_raw = self.global_cc_var.get().strip()
        cc_list = _parse_cc_addresses(cc_raw)

        # Bestätigungs-Dialog mit den *tatsächlich* zu verwendenden Namen.
        # So ist sofort sichtbar, ob eine Namensänderung korrekt übernommen wurde.
        preview_lines = [
            f"{i + 1:>2}.  {(e.get('name') or '—'):<28}  {e.get('email')}"
            for i, e in enumerate(entries)
        ]
        preview_block = "\n".join(preview_lines[:15])
        if len(entries) > 15:
            preview_block += f"\n… und {len(entries) - 15} weitere"
        cc_line = (
            f"\nCC (für alle Mails): {', '.join(cc_list)}\n"
            if cc_list
            else "\nCC (für alle Mails): — keiner —\n"
        )
        if not messagebox.askyesno(
            "E-Mails erstellen",
            f"Es werden {len(entries)} Outlook-Entwürfe mit folgenden Namen erzeugt:\n\n"
            f"{preview_block}\n"
            f"{cc_line}\n"
            f"Hinweis: Alte, noch offene Entwürfe aus einem vorherigen Lauf werden "
            f"NICHT überschrieben – bitte ggf. vorher schließen.\n\n"
            f"Fortfahren?",
        ):
            return

        if not self._current_tpl:
            messagebox.showwarning("Vorlage", "Bitte in „2. Vorlage“ eine Vorlage auswählen oder anlegen.")
            return

        subj_tpl = self.subject_var.get()

        self.send_button.configure(state="disabled", text="⏳  Wird erstellt...")
        self.progress_label.configure(text="Starte...")

        def on_progress(current, total):
            self.after(0, lambda c=current, t=total: self.progress_label.configure(
                text=f"{c}/{t} E-Mails geöffnet..."
            ))

        tpl = self._current_tpl

        def run():
            success, errors = create_batch_emails(entries, subj_tpl, tpl, on_progress, cc=cc_list)

            def done():
                self.send_button.configure(state="normal", text="📧  E-Mails in Outlook öffnen")
                if errors:
                    self.progress_label.configure(
                        text=f"Fertig: {success} erfolgreich, {len(errors)} Fehler",
                        text_color=DANGER,
                    )
                    messagebox.showwarning("Fehler", "\n".join(errors))
                else:
                    self.progress_label.configure(
                        text=f"Fertig! {success} E-Mail{'s' if success != 1 else ''} in Outlook geöffnet.",
                        text_color=SUCCESS,
                    )

            self.after(0, done)

        threading.Thread(target=run, daemon=True).start()
