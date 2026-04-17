#!/usr/bin/env python3
"""Tempus Login Mailer – Bulk Outlook email creator for login credentials."""

import os
import subprocess
import sys

if getattr(sys, "frozen", False):
    os.chdir(os.path.dirname(sys.executable))
else:
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

from app import App


def _macos_bring_process_to_front(pid: int) -> None:
    """Nach dem Start das Fenster in den Vordergrund holen (Tk allein reicht auf macOS oft nicht)."""
    if sys.platform != "darwin":
        return
    subprocess.run(
        [
            "osascript",
            "-e",
            f'tell application "System Events" to set frontmost of first process whose unix id is {pid} to true',
        ],
        capture_output=True,
        text=True,
    )


def main():
    app = App()
    if sys.platform == "darwin":
        pid = os.getpid()
        for ms in (200, 500, 1200):
            app.after(ms, lambda p=pid: _macos_bring_process_to_front(p))
    app.mainloop()


if __name__ == "__main__":
    main()
