#!/usr/bin/env python3
"""Remove embedded presigned URLs (AKIA in git) from demo HTML; use runtime config instead."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "Onboarding Valkeen/onboarding-app/public"

PRESIGNED_HELPER = """
/** Presigned PUT — nur Fallback; URLs in /config/demo-presigned-fallback.json (nicht im Git). */
let PRESIGNED_PUT_URL = null;

async function ensureDemoPresignedPutUrl() {
  if (PRESIGNED_PUT_URL) return PRESIGNED_PUT_URL;
  try {
    const r = await fetch('/config/demo-presigned-fallback.json', { cache: 'no-store' });
    if (!r.ok) return null;
    const cfg = await r.json();
    PRESIGNED_PUT_URL = cfg[DEMO_PRESIGNED_CONFIG_KEY] || null;
  } catch (e) {
    console.warn('Demo presigned config:', e);
  }
  return PRESIGNED_PUT_URL;
}
""".strip()

FILES = {
    "tempus-demo-pm.html": "pm",
    "tempus-demo-rm.html": "rm",
    "tempus-demo-bpafg.html": "bpafg",
    "tempus-demo-team-resources.html": "team-resources",
}

PM_MEDIA_SLOTS = """const MEDIA_SLOTS = {
  'img-01': { file: 'img-01.jpg', ct: 'image/jpeg' },
  'img-02': { file: 'img-02.jpg', ct: 'image/jpeg' },
  'img-03': { file: 'img-03.jpg', ct: 'image/jpeg' },
  'img-04': { file: 'img-04.jpg', ct: 'image/jpeg' },
  'img-05': { file: 'img-05.jpg', ct: 'image/jpeg' },
  'img-06': { file: 'img-06.jpg', ct: 'image/jpeg' },
  'img-07': { file: 'img-07.jpg', ct: 'image/jpeg' },
  'img-08': { file: 'img-08.jpg', ct: 'image/jpeg' },
  'img-09': { file: 'img-09.jpg', ct: 'image/jpeg' },
  'img-10': { file: 'img-10.jpg', ct: 'image/jpeg' },
  'vid-01': { file: 'vid-01.mp4', ct: 'video/mp4' },
  'vid-02': { file: 'vid-02.mp4', ct: 'video/mp4' },
  'vid-03': { file: 'vid-03.mp4', ct: 'video/mp4' },
  'vid-04': { file: 'vid-04.mp4', ct: 'video/mp4' },
  'vid-05': { file: 'vid-05.mp4', ct: 'video/mp4' },
};

let __mediaPutUrlsLoaded = false;
async function ensureMediaSlotPutUrls() {
  if (__mediaPutUrlsLoaded) return;
  try {
    const r = await fetch('/config/tempus-demo-pm-media-slots.json', { cache: 'no-store' });
    if (r.ok) {
      const puts = await r.json();
      for (const [slot, put] of Object.entries(puts)) {
        if (MEDIA_SLOTS[slot]) MEDIA_SLOTS[slot].put = put;
      }
    }
  } catch (e) {
    console.warn('Media presigned config:', e);
  }
  __mediaPutUrlsLoaded = true;
}
"""

PM_MEDIA_HELPER_COMMENT = """   MEDIA UPLOAD — PUT-URLs aus /config/tempus-demo-pm-media-slots.json (refresh-demo-state-url.sh)
   CDN-Basis: https://manuel-weiss.ch/media/tempus-demo-pm/"""


def patch_file(path: Path, config_key: str) -> None:
    text = path.read_text(encoding="utf-8")

    text = re.sub(
        r"// Presigned PUT[^\n]*\nconst PRESIGNED_PUT_URL = '[^']*';\n",
        "",
        text,
        count=1,
    )
    text = re.sub(
        r"const PRESIGNED_PUT_URL = '[^']*';\n",
        "",
        text,
        count=1,
    )

    if "ensureDemoPresignedPutUrl" not in text:
        insert = (
            f"const DEMO_PRESIGNED_CONFIG_KEY = '{config_key}';\n\n"
            + PRESIGNED_HELPER
            + "\n\n"
        )
        marker = "const DEMO_SCRIPT_EDIT_PASSWORD"
        if marker not in text:
            raise SystemExit(f"marker not found in {path}")
        text = text.replace(marker, insert + marker, 1)

    text = text.replace(
        "    if (!apiOk) {\n      const res = await fetch(PRESIGNED_PUT_URL, {",
        "    if (!apiOk) {\n      await ensureDemoPresignedPutUrl();\n      if (!PRESIGNED_PUT_URL) {\n        localStorage.setItem(STORAGE_KEY, payload);\n        console.warn('Cloud-Sync: API und Presigned-Fallback nicht verfügbar — nur lokal gespeichert.');\n        return;\n      }\n      const res = await fetch(PRESIGNED_PUT_URL, {",
    )

    text = text.replace(
        "    fetch(PRESIGNED_PUT_URL, {\n      method: 'PUT',\n      headers: { 'Content-Type': 'application/json' },\n      body: resetBody\n    }).catch(() => {});",
        "    ensureDemoPresignedPutUrl().then((url) => {\n      if (url) {\n        fetch(url, {\n          method: 'PUT',\n          headers: { 'Content-Type': 'application/json' },\n          body: resetBody\n        }).catch(() => {});\n      }\n    });",
    )

    if path.name == "tempus-demo-pm.html":
        text = re.sub(
            r"const MEDIA_SLOTS = \{[\s\S]*?\};\n",
            PM_MEDIA_SLOTS + "\n",
            text,
            count=1,
        )
        text = text.replace(
            "   MEDIA UPLOAD — S3 Presigned PUT-URLs (10 Bild + 5 Video Slots)\n   Slots erneuern: python3 -c \"...\" oder refresh-demo-state-url.sh",
            PM_MEDIA_HELPER_COMMENT,
        )
        text = text.replace(
            "  const slotData = MEDIA_SLOTS[slot];\n\n  // UI:",
            "  await ensureMediaSlotPutUrls();\n  const slotData = MEDIA_SLOTS[slot];\n  if (!slotData.put) {\n    statusEl.textContent = presenterLang() === 'de'\n      ? '❌ Keine Upload-URL — ./refresh-demo-state-url.sh ausführen und deployen'\n      : '❌ No upload URL — run ./refresh-demo-state-url.sh and deploy';\n    if (uploadBtn) uploadBtn.style.pointerEvents = '';\n    return;\n  }\n\n  // UI:",
        )
        text = text.replace(
            "? '❌ Keine freien Slots — bitte refresh-demo-state-url.sh ausführen'",
            "? '❌ Keine freien Slots'",
        )

    path.write_text(text, encoding="utf-8")
    print(f"✓ {path.relative_to(ROOT)}")


def main() -> None:
    for name, key in FILES.items():
        patch_file(PUBLIC / name, key)


if __name__ == "__main__":
    main()
