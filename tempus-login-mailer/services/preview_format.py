"""E-Mail-Vorschau: HTML in lesbaren Klartext ohne riesige data:-Bildblöcke."""

from __future__ import annotations

import html as html_module
import re


def body_to_preview_text(body: str, *, is_html: bool) -> str:
    if not is_html or not body.strip():
        return body

    t = body
    t = re.sub(r"(?is)<script\b[^>]*>.*?</script>", "", t)
    t = re.sub(r"(?is)<style\b[^>]*>.*?</style>", "", t)
    t = re.sub(r"(?is)<picture\b[^>]*>.*?</picture>", "\n[Bild]\n", t)
    t = re.sub(r"(?is)<img\b[^>]*>", "\n[Bild]\n", t)
    t = re.sub(r"(?is)<svg\b[^>]*>.*?</svg>", "\n[Grafik]\n", t)
    t = re.sub(r"(?i)</(p|div|tr|h[1-6]|table)\b[^>]*>", "\n", t)
    t = re.sub(r"(?i)<br\s*/?>", "\n", t)
    t = re.sub(r"(?i)<li\b[^>]*>", "\n• ", t)
    t = re.sub(r"<[^>]+>", "", t)
    t = html_module.unescape(t)
    lines = [re.sub(r"[ \t]+", " ", ln).rstrip() for ln in t.splitlines()]
    joined = "\n".join(lines)
    return re.sub(r"\n{3,}", "\n\n", joined).strip()
