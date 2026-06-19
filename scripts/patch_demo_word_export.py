#!/usr/bin/env python3
"""Add Word export button + shared script to all tempus demo HTML files."""

from pathlib import Path

PUBLIC = Path(__file__).resolve().parents[1] / "Onboarding Valkeen/onboarding-app/public"

DEMOS = [
    "tempus-demo-pm.html",
    "tempus-demo-rm.html",
    "tempus-demo-bpafg.html",
    "tempus-demo-team-resources.html",
]

TOOLBAR_BTN = (
    '      <button type="button" class="edit-actions-btn demo-export-word-btn" '
    'onclick="DemoWordExport.export()" '
    'title="Demo-Skript als Word exportieren (aktuelle Sprache)">📄 Word</button>\n'
)

SCRIPT_INJECT = '<script src="demo-script-export-word.js"></script>\n'


def patch(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    changed = False

    if "demo-script-export-word.js" not in text:
        marker = "</template>\n\n<script>"
        if marker in text:
            text = text.replace(marker, f"</template>\n\n{SCRIPT_INJECT}<script>", 1)
            changed = True
        else:
            # fallback: first <script> after body
            idx = text.find("<script>\n/*")
            if idx == -1:
                idx = text.find("<script>\n/**")
            if idx != -1:
                text = text[:idx] + SCRIPT_INJECT + text[idx:]
                changed = True

    if "demo-export-word-btn" not in text:
        old = "      </button>\n      <div id=\"edit-extra\""
        if old in text:
            text = text.replace(old, f"      </button>\n{TOOLBAR_BTN}      <div id=\"edit-extra\"", 1)
            changed = True

    if changed:
        path.write_text(text, encoding="utf-8")
    return changed


def main():
    for name in DEMOS:
        p = PUBLIC / name
        if not p.exists():
            print(f"SKIP missing: {p}")
            continue
        print(f"{'OK' if patch(p) else 'unchanged'}: {p.name}")


if __name__ == "__main__":
    main()
