"""Programmatic annotations on screenshots: yellow highlight rectangles, arrows,
numbered step badges. Used to recreate the SHS-style step-by-step screenshots.

Usage from another script::

    from annotate import annotate

    annotate(
        src="screenshots/raw/03_grid.png",
        dst="screenshots/03_grid_annot.png",
        rects=[
            {"box": (120, 30, 280, 70), "label": "1"},
            {"box": (320, 30, 480, 70), "label": "2"},
        ],
    )

The annotations match the SHS user guide style:
- yellow translucent fill (40 % alpha) with a 3 px gold border
- circular numbered badge (gold) at the top-left of each rectangle
- optional arrows pointing into a rectangle

Coordinates are in pixels relative to the source image (origin top-left).
"""

from __future__ import annotations

from pathlib import Path
from typing import Iterable, Sequence

from PIL import Image, ImageDraw, ImageFont


YELLOW_FILL = (255, 224, 102, 90)
YELLOW_BORDER = (242, 184, 7, 255)
ARROW_COLOR = (242, 184, 7, 255)
BADGE_FILL = (242, 184, 7, 255)
BADGE_TEXT = (43, 36, 8, 255)
RED_BORDER = (197, 38, 38, 255)
RED_FILL = (255, 120, 120, 70)


def _font(size: int) -> ImageFont.FreeTypeFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial Bold.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def annotate(
    src: str | Path,
    dst: str | Path,
    rects: Sequence[dict] = (),
    arrows: Sequence[dict] = (),
    rect_color: str = "yellow",
) -> Path:
    """Render annotations onto a screenshot.

    Each rect is ``{"box": (x1, y1, x2, y2), "label": "1", "color": "yellow"|"red"}``.
    Each arrow is ``{"from": (x, y), "to": (x, y)}``.
    """
    src_path = Path(src)
    dst_path = Path(dst)
    dst_path.parent.mkdir(parents=True, exist_ok=True)

    base = Image.open(src_path).convert("RGBA")
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    for rect in rects:
        x1, y1, x2, y2 = rect["box"]
        color = rect.get("color", rect_color)
        fill = RED_FILL if color == "red" else YELLOW_FILL
        border = RED_BORDER if color == "red" else YELLOW_BORDER
        draw.rectangle((x1, y1, x2, y2), fill=fill, outline=border, width=3)
        label = str(rect.get("label", "")).strip()
        if label:
            _draw_badge(draw, (x1, y1), label)

    for arrow in arrows:
        _draw_arrow(draw, arrow["from"], arrow["to"])

    composed = Image.alpha_composite(base, overlay)
    composed.convert("RGB").save(dst_path, format="PNG", optimize=True)
    return dst_path


def _draw_badge(draw: ImageDraw.ImageDraw, anchor: tuple[int, int], label: str) -> None:
    radius = 16 if len(label) <= 2 else 20
    cx, cy = anchor[0], anchor[1]
    box = (cx - radius, cy - radius, cx + radius, cy + radius)
    draw.ellipse(box, fill=BADGE_FILL, outline=(255, 255, 255, 255), width=2)
    font = _font(18)
    text_w, text_h = draw.textbbox((0, 0), label, font=font)[2:]
    text_pos = (cx - text_w / 2, cy - text_h / 2 - 2)
    draw.text(text_pos, label, fill=BADGE_TEXT, font=font)


def _draw_arrow(
    draw: ImageDraw.ImageDraw,
    start: tuple[int, int],
    end: tuple[int, int],
    width: int = 4,
    head: int = 14,
) -> None:
    draw.line([start, end], fill=ARROW_COLOR, width=width)
    # arrow head
    import math

    angle = math.atan2(end[1] - start[1], end[0] - start[0])
    a1 = angle + math.radians(150)
    a2 = angle - math.radians(150)
    p1 = (end[0] + head * math.cos(a1), end[1] + head * math.sin(a1))
    p2 = (end[0] + head * math.cos(a2), end[1] + head * math.sin(a2))
    draw.polygon([end, p1, p2], fill=ARROW_COLOR)


def crop_and_save(
    src: str | Path,
    dst: str | Path,
    box: tuple[int, int, int, int],
) -> Path:
    """Convenience: crop a region and save it directly."""
    src_path = Path(src)
    dst_path = Path(dst)
    dst_path.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(src_path) as img:
        img.crop(box).save(dst_path, format="PNG", optimize=True)
    return dst_path


__all__ = ["annotate", "crop_and_save"]
