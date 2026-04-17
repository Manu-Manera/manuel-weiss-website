"""Geführte Schrittleiste: Tabs anwählen, Kurztext, Zurück/Weiter."""

from __future__ import annotations

from collections.abc import Callable

import customtkinter as ctk


class WorkflowStrip(ctk.CTkFrame):
    def __init__(
        self,
        master,
        *,
        step_titles: tuple[str, ...],
        step_hints: tuple[str, ...],
        accent: str,
        accent_hover: str,
        muted: str,
        on_step: Callable[[int], None],
        on_prev: Callable[[], None],
        on_next: Callable[[], None],
        **kwargs,
    ):
        super().__init__(master, fg_color="transparent", **kwargs)
        self._accent = accent
        self._accent_hover = accent_hover
        self._muted = muted
        self._on_step = on_step
        self._on_prev = on_prev
        self._on_next = on_next
        self._titles = step_titles
        self._hints = step_hints
        self._active = 0
        self._buttons: list[ctk.CTkButton] = []

        bar = ctk.CTkFrame(self, fg_color="#0F172A", corner_radius=12, border_width=1, border_color="#334155")
        bar.grid(row=0, column=0, sticky="ew", pady=(0, 6))
        bar.grid_columnconfigure(tuple(range(len(step_titles))), weight=1)

        for i, title in enumerate(step_titles):
            b = ctk.CTkButton(
                bar,
                text=f"{i + 1}. {title}",
                height=40,
                corner_radius=8,
                font=ctk.CTkFont(size=13, weight="bold"),
                command=lambda idx=i: self._click_step(idx),
            )
            b.grid(row=0, column=i, padx=4, pady=8, sticky="ew")
            self._buttons.append(b)

        self._hint = ctk.CTkLabel(
            self,
            text="",
            font=ctk.CTkFont(size=13),
            text_color="#CBD5E1",
            wraplength=1000,
            justify="left",
            anchor="w",
        )
        self._hint.grid(row=1, column=0, sticky="ew", padx=(4, 4), pady=(2, 6))

        nav = ctk.CTkFrame(self, fg_color="transparent")
        nav.grid(row=2, column=0, sticky="ew")
        nav.grid_columnconfigure(1, weight=1)

        ctk.CTkButton(
            nav, text="← Zurück", width=120, height=34, corner_radius=8,
            fg_color=self._muted, hover_color="#475569",
            command=self._on_prev,
        ).grid(row=0, column=0, padx=(0, 8), sticky="w")

        ctk.CTkButton(
            nav, text="Weiter →", width=120, height=34, corner_radius=8,
            fg_color=self._accent, hover_color=self._accent_hover,
            command=self._on_next,
        ).grid(row=0, column=2, padx=(8, 0), sticky="e")

        self.set_active(0)

    def _click_step(self, idx: int) -> None:
        # Keine doppelte Aktivierung: der Callback kümmert sich selbst um set_active.
        self._on_step(idx)

    def set_active(self, idx: int) -> None:
        idx = max(0, min(idx, len(self._buttons) - 1))
        self._active = idx
        for i, b in enumerate(self._buttons):
            active = i == idx
            b.configure(
                fg_color=self._accent if active else "#1E293B",
                hover_color=self._accent_hover if active else "#334155",
                text_color="white" if active else "#94A3B8",
            )
        if idx < len(self._hints):
            self._hint.configure(text=self._hints[idx])
        else:
            self._hint.configure(text="")
