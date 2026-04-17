"""Modal: neue E-Mail-Vorlage per Formular (HTML oder Word) anlegen."""

from __future__ import annotations

import re
from collections.abc import Callable
from pathlib import Path

import customtkinter as ctk
from tkinter import filedialog, messagebox

from services.template_engine import DEFAULT_SUBJECT, PLACEHOLDERS
from services.template_store import (
    DEFAULT_NEW_BODY_HTML,
    create_new_template_from_docx,
    create_template_with_html_body,
)


class TemplateAssistantWindow(ctk.CTkToplevel):
    def __init__(
        self,
        master,
        app_dir: Path,
        *,
        accent: str,
        accent_hover: str,
        on_created: Callable[[str], None],
    ):
        super().__init__(master)
        self._app_dir = app_dir
        self._on_created = on_created
        self.title("Vorlagen-Assistent")
        self.geometry("780x640")
        self.minsize(640, 520)
        self.transient(master)
        self.grab_set()

        self._slug = ctk.StringVar()
        self._title = ctk.StringVar()
        self._subject = ctk.StringVar(value=DEFAULT_SUBJECT)
        self._format = ctk.StringVar(value="html")
        self._word_path: Path | None = None

        pad = {"padx": 16, "pady": 8}
        ctk.CTkLabel(
            self,
            text="Neue Vorlage anlegen",
            font=ctk.CTkFont(size=18, weight="bold"),
        ).grid(row=0, column=0, sticky="w", **pad)

        ctk.CTkLabel(
            self,
            text="Ordnername unter templates/ (nur a–z, 0–9, _ und -):",
            font=ctk.CTkFont(size=13),
        ).grid(row=1, column=0, sticky="w", padx=16, pady=(4, 0))
        ctk.CTkEntry(self, textvariable=self._slug, height=34, corner_radius=8, border_width=1).grid(
            row=2, column=0, sticky="ew", padx=16, pady=4
        )

        ctk.CTkLabel(self, text="Anzeigetitel:", font=ctk.CTkFont(size=13)).grid(
            row=3, column=0, sticky="w", padx=16, pady=(8, 0)
        )
        ctk.CTkEntry(self, textvariable=self._title, height=34, corner_radius=8, border_width=1).grid(
            row=4, column=0, sticky="ew", padx=16, pady=4
        )

        ctk.CTkLabel(self, text="Betreff (Platzhalter wie {NAME} möglich):", font=ctk.CTkFont(size=13)).grid(
            row=5, column=0, sticky="w", padx=16, pady=(8, 0)
        )
        ctk.CTkEntry(self, textvariable=self._subject, height=34, corner_radius=8, border_width=1).grid(
            row=6, column=0, sticky="ew", padx=16, pady=4
        )

        fmt = ctk.CTkFrame(self, fg_color="#1E293B", corner_radius=10)
        fmt.grid(row=7, column=0, sticky="ew", padx=16, pady=10)
        ctk.CTkLabel(fmt, text="Format", font=ctk.CTkFont(size=13, weight="bold")).grid(
            row=0, column=0, padx=12, pady=(8, 4), sticky="w"
        )
        ctk.CTkRadioButton(
            fmt, text="HTML in dieser Maske schreiben", variable=self._format, value="html",
            command=self._toggle_format, font=ctk.CTkFont(size=13),
        ).grid(row=1, column=0, padx=12, pady=4, sticky="w")
        ctk.CTkRadioButton(
            fmt, text="Bestehende Word-Datei (.docx) übernehmen", variable=self._format, value="docx",
            command=self._toggle_format, font=ctk.CTkFont(size=13),
        ).grid(row=2, column=0, padx=12, pady=(4, 8), sticky="w")

        self._word_btn = ctk.CTkButton(
            self,
            text="Word-Datei wählen…",
            command=self._pick_word,
            fg_color="#475569",
            hover_color="#64748B",
            height=34,
            state="disabled",
        )
        self._word_btn.grid(row=8, column=0, sticky="w", padx=16, pady=(0, 6))
        self._word_label = ctk.CTkLabel(self, text="", font=ctk.CTkFont(size=12), text_color="#94A3B8", anchor="w")
        self._word_label.grid(row=9, column=0, sticky="ew", padx=16, pady=(0, 4))

        ctk.CTkLabel(self, text="HTML-Text (nur bei Format „HTML“):", font=ctk.CTkFont(size=13, weight="bold")).grid(
            row=10, column=0, sticky="w", padx=16, pady=(6, 4)
        )

        ph_row = ctk.CTkFrame(self, fg_color="transparent")
        ph_row.grid(row=11, column=0, sticky="ew", padx=16, pady=(0, 6))
        for token in PLACEHOLDERS:
            ctk.CTkButton(
                ph_row,
                text=token,
                width=72,
                height=28,
                corner_radius=6,
                fg_color="#334155",
                hover_color="#475569",
                font=ctk.CTkFont(size=11),
                command=lambda t=token: self._insert_token(t),
            ).pack(side="left", padx=(0, 6))

        self._body = ctk.CTkTextbox(self, height=220, corner_radius=8, border_width=1, font=ctk.CTkFont(family="Menlo", size=12))
        self._body.grid(row=12, column=0, sticky="nsew", padx=16, pady=(0, 10))
        self._body.insert("1.0", DEFAULT_NEW_BODY_HTML)

        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(12, weight=1)

        btn_row = ctk.CTkFrame(self, fg_color="transparent")
        btn_row.grid(row=13, column=0, sticky="ew", padx=16, pady=(0, 16))
        btn_row.grid_columnconfigure(0, weight=1)

        ctk.CTkButton(
            btn_row, text="Abbrechen", width=120, command=self.destroy,
            fg_color="#475569", hover_color="#64748B", corner_radius=8, height=36,
        ).pack(side="right", padx=(8, 0))
        ctk.CTkButton(
            btn_row, text="Vorlage anlegen", width=160, command=self._create,
            fg_color=accent, hover_color=accent_hover, corner_radius=8, height=36,
            font=ctk.CTkFont(size=14, weight="bold"),
        ).pack(side="right")

        self._toggle_format()

    def _toggle_format(self) -> None:
        docx = self._format.get() == "docx"
        self._word_btn.configure(state="normal" if docx else "disabled")
        if docx:
            self._body.configure(state="disabled")
        else:
            self._body.configure(state="normal")

    def _pick_word(self) -> None:
        path = filedialog.askopenfilename(
            parent=self,
            title="Word-Vorlage wählen",
            filetypes=[("Word", "*.docx"), ("Alle", "*.*")],
        )
        if path:
            self._word_path = Path(path)
            self._word_label.configure(text=self._word_path.name)

    def _insert_token(self, token: str) -> None:
        if self._format.get() != "html":
            return
        self._body.configure(state="normal")
        self._body.insert("insert", token)
        self._body.focus_set()

    def _create(self) -> None:
        slug = (self._slug.get() or "").strip()
        if not slug or not re.match(r"^[a-zA-Z0-9_-]+$", slug):
            messagebox.showerror("Name", "Bitte einen gültigen technischen Ordnernamen eingeben.", parent=self)
            return
        title = (self._title.get() or "").strip() or slug.replace("_", " ").title()
        subject = (self._subject.get() or "").strip() or DEFAULT_SUBJECT

        try:
            if self._format.get() == "docx":
                if not self._word_path or not self._word_path.is_file():
                    messagebox.showwarning("Word", "Bitte eine .docx-Datei wählen.", parent=self)
                    return
                create_new_template_from_docx(
                    self._app_dir, slug, self._word_path, title=title, subject=subject,
                )
            else:
                body = self._body.get("1.0", "end").rstrip("\n")
                if not body.strip():
                    messagebox.showwarning("HTML", "Der HTML-Text ist leer.", parent=self)
                    return
                create_template_with_html_body(
                    self._app_dir, slug, body_html=body, title=title, subject=subject,
                )
        except FileExistsError:
            messagebox.showerror("Vorlage", f"Der Ordner „{slug}“ existiert bereits.", parent=self)
            return
        except OSError as e:
            messagebox.showerror("Vorlage", str(e), parent=self)
            return

        messagebox.showinfo(
            "Vorlage",
            f"Vorlage „{slug}“ wurde unter templates/{slug}/ angelegt.\n"
            "Sie ist in Tab „2. Vorlage“ auswählbar; HTML bearbeiten Sie in Tab „3. Bearbeiten“.",
            parent=self,
        )
        self._on_created(slug)
        self.destroy()
