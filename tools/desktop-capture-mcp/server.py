#!/usr/bin/env python3
"""
Lokaler MCP-Server: macht Screenshots des Desktops (macOS/Linux/Windows via mss).
Cursor kann die PNG-Datei mit read_file einlesen (inkl. Vision).

Hinweis: Steuert nicht den eingebauten Cursor-Browser – dafür bleibt das
Browser-MCP zuständig. Dieses Tool zeigt, was auf dem Bildschirm sichtbar ist
(z. B. externes Safari-Fenster, gesamter Desktop).
"""

from __future__ import annotations

from pathlib import Path

import mss
import mss.tools
from mcp.server.fastmcp import FastMCP

CAPTURES = Path(__file__).resolve().parent / "captures"
DEFAULT_FILE = CAPTURES / "latest.png"

mcp = FastMCP("desktop-capture")


def _ensure_captures_dir() -> None:
    CAPTURES.mkdir(parents=True, exist_ok=True)


@mcp.tool()
def list_monitors() -> str:
    """Listet alle Bildschirme (mss-Indizes). Index 0 = virtuelle Gesamtfläche, ab 1 einzelne Monitore."""
    _ensure_captures_dir()
    with mss.mss() as sct:
        lines = []
        for i, mon in enumerate(sct.monitors):
            lines.append(
                f"{i}: left={mon['left']} top={mon['top']} "
                f"width={mon['width']} height={mon['height']}"
            )
        return "Monitors (use capture_display with monitor_index):\n" + "\n".join(lines)


@mcp.tool()
def capture_display(monitor_index: int = 1) -> str:
    """
    Screenshot eines Monitors. Speichert PNG unter captures/latest.png (wird überschrieben).

    monitor_index: 1 = erster physischer Monitor (üblich). 0 = alle Monitore in einem Bild.
    """
    _ensure_captures_dir()
    with mss.mss() as sct:
        if monitor_index < 0 or monitor_index >= len(sct.monitors):
            return (
                f"Invalid monitor_index={monitor_index}. "
                f"Valid: 0..{len(sct.monitors) - 1}. Call list_monitors first."
            )
        region = sct.monitors[monitor_index]
        shot = sct.grab(region)
        mss.tools.to_png(shot.rgb, shot.size, output=str(DEFAULT_FILE))
    return (
        f"Saved screenshot to {DEFAULT_FILE}. "
        f"Use read_file on this path in the workspace so the assistant can see the image."
    )


@mcp.tool()
def capture_region(left: int, top: int, width: int, height: int) -> str:
    """Screenshot eines Rechtecks in Bildschirmkoordinaten (Pixel). Speichert nach captures/latest.png."""
    _ensure_captures_dir()
    if width <= 0 or height <= 0:
        return "width and height must be positive."
    bbox = {"left": left, "top": top, "width": width, "height": height}
    with mss.mss() as sct:
        shot = sct.grab(bbox)
        mss.tools.to_png(shot.rgb, shot.size, output=str(DEFAULT_FILE))
    return f"Saved region screenshot to {DEFAULT_FILE}."


if __name__ == "__main__":
    mcp.run()
