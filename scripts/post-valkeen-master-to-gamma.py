#!/usr/bin/env python3
"""
Postet den Valkeen-2026-Master (121 Folien) als Gamma-Präsentation ins Workspace.

Hinweis: Gamma-API kann keine .pptx hochladen — Inhalt kommt aus valkeen-2026-master-manifest.json
(Text der PPTX). Layout/Folienmaster werden von Gamma neu gesetzt (Valkeen-Stil per Instructions).

Env: GAMMA_API_KEY (docs/horizon_workshop/.env oder export)
Optional: VALKEEN_GAMMA_THEME_ID, GAMMA_FOLDER_IDS (kommagetrennt)
"""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = (
    ROOT
    / "Onboarding Valkeen/onboarding-app/src/data/valkeen-2026-master-manifest.json"
)
VALKEEN_ENV = Path("/Users/manumanera/Valkeen/docs/horizon_workshop/.env")
OUTPUT_JSON = ROOT / "docs/valkeen-master-gamma-post-result.json"

API_BASE = "https://public-api.gamma.app/v1.0"
POLL_SEC = 8
POLL_MAX = 120  # ~16 min
MAX_CARDS_PER_REQUEST = 60  # Gamma API hard limit


def load_dotenv(path: Path) -> None:
    if not path.is_file():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        k, v = k.strip(), v.strip().strip("'\"")
        if k and k not in os.environ:
            os.environ[k] = v


def api(method: str, path: str, key: str, body: dict | None = None) -> dict:
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(
        f"{API_BASE}{path}",
        data=data,
        headers={
            "X-API-KEY": key,
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "Valkeen-Post-Master/1.0",
        },
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"HTTP {e.code}: {e.read().decode('utf-8', errors='replace')[:800]}") from e


def build_input_text(manifest: dict, slide_range: tuple[int, int] | None = None) -> str:
    slides = manifest.get("slides") or []
    if slide_range:
        lo, hi = slide_range
        slides = [s for s in slides if lo <= (s.get("index") or 0) <= hi]
    parts = [
        "Erstelle eine Präsentation im Valkeen-2026-Master-Stil (Tempus Resource). "
        "Jede Sektion zwischen --- ist genau eine Folie. Reihenfolge und Inhalt beibehalten.\n",
        "Platzhalter Kunde: {{customer}}\n",
        "Valkeen 2026 Corporate Design: Primär #0f4c81, Akzent #00a878, Türkis #0ea5e9, Slate #335B74. "
        "Navy-Gradient oder Executive-Dunkel, grüner Akzent links. Logo oben links, Footer Valkeen GmbH · Tempus Resource. "
        "Wenig Text pro Karte, starke Überschriften.\n",
    ]
    for slide in slides:
        idx = slide.get("index", "")
        headline = (slide.get("headline") or f"Slide {idx}").strip()
        headline = headline.replace("\n---\n", " — ")
        block = [f"# Folie {idx}: {headline}"]
        for line in (slide.get("lines") or []):
            line = line.strip().replace("\n---\n", " — ")
            if line and line != headline and not line.startswith("©"):
                block.append(f"- {line[:500]}")
        parts.append("\n".join(block))
    # cardSplit=auto: keine \\n---\\n (sonst >60 Karten); Gamma teilt per numCards
    return "\n\n".join(parts)


def run_one_generation(
    api_key: str,
    manifest: dict,
    slide_range: tuple[int, int],
    part_label: str,
) -> dict:
    lo, hi = slide_range
    slides = [s for s in manifest.get("slides", []) if lo <= (s.get("index") or 0) <= hi]
    card_count = min(len(slides), MAX_CARDS_PER_REQUEST)
    input_text = build_input_text(manifest, slide_range)
    print(f"\n=== {part_label}: Folien {lo}–{hi} ({card_count} Karten, {len(input_text):,} Zeichen) ===")

    body: dict = {
        "inputText": input_text,
        "textMode": "preserve",
        "format": "presentation",
        "cardSplit": "auto",
        "numCards": card_count,
        "title": f"Tempus Resource · Valkeen 2026 Master ({part_label})",
        "additionalInstructions": (
            "Valkeen 2026 Master-Template. Exakt 121 Folien. Corporate navy/teal. "
            "Keine Stock-Foto-Wände. Diagramme und Icons wo sinnvoll."
        ),
        "textOptions": {
            "amount": "medium",
            "language": "de",
            "tone": "professionell, klar",
            "audience": "Enterprise IT, PMO, Implementierung",
        },
        "imageOptions": {
            "source": "themeAccent",
            "style": "Valkeen corporate, navy and teal, minimal stock",
        },
        "cardOptions": {
            "dimensions": "16x9",
            "headerFooter": {
                "topLeft": {
                    "type": "image",
                    "source": "custom",
                    "src": "https://manuel-weiss.ch/onboarding/kickoff/image1.png",
                    "size": "sm",
                },
                "bottomRight": {"type": "text", "value": "Valkeen GmbH · Tempus Resource"},
                "hideFromFirstCard": False,
            },
        },
    }
    theme = os.environ.get("VALKEEN_GAMMA_THEME_ID", "").strip()
    if theme:
        body["themeId"] = theme
    folders = os.environ.get("GAMMA_FOLDER_IDS", "").strip()
    if folders:
        body["folderIds"] = [x.strip() for x in folders.split(",") if x.strip()]

    print("Starte Gamma-Generierung …")
    created = api("POST", "/generations", api_key, body)
    gen_id = created.get("generationId")
    if not gen_id:
        raise RuntimeError(json.dumps(created, indent=2))

    print(f"generationId: {gen_id}")
    for i in range(POLL_MAX):
        if i:
            time.sleep(POLL_SEC)
        st = api("GET", f"/generations/{gen_id}", api_key)
        status = st.get("status", "?")
        print(f"  [{i+1}] status={status}", flush=True)
        if status == "completed":
            st["part"] = part_label
            st["slideRange"] = [lo, hi]
            print(f"✅ {part_label} fertig: {st.get('gammaUrl', '—')}")
            return st
        if status == "failed":
            raise RuntimeError(json.dumps(st, indent=2))

    raise TimeoutError(f"Timeout — generationId={gen_id}")


def main() -> int:
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--part", choices=("1", "2", "all"), default="all")
    args = parser.parse_args()

    load_dotenv(VALKEEN_ENV)
    api_key = os.environ.get("GAMMA_API_KEY", "").strip()
    if not api_key:
        print("GAMMA_API_KEY fehlt (Valkeen docs/horizon_workshop/.env)", file=sys.stderr)
        return 1

    if not MANIFEST.is_file():
        print(f"Manifest fehlt: {MANIFEST}", file=sys.stderr)
        return 1

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    total = manifest.get("slideCount") or len(manifest.get("slides", []))
    print(f"Manifest: {total} Folien (API max {MAX_CARDS_PER_REQUEST} Karten/Request)")

    parts = []
    if args.part in ("1", "all"):
        parts.append(("Teil 1/2", (1, 60)))
    if args.part in ("2", "all"):
        parts.append(("Teil 2/2", (61, total)))

    results = []
    try:
        for label, rng in parts:
            results.append(run_one_generation(api_key, manifest, rng, label))
    except (RuntimeError, TimeoutError) as e:
        print(f"\nFehler: {e}", file=sys.stderr)
        if results:
            OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
            OUTPUT_JSON.write_text(
                json.dumps({"partial": results, "error": str(e)}, indent=2, ensure_ascii=False),
                encoding="utf-8",
            )
        return 1

    out = {"parts": results, "note": "Gamma API: kein PPTX-Upload; 2 Teile wegen 60-Karten-Limit"}
    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_JSON.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nGespeichert: {OUTPUT_JSON}")
    for r in results:
        print(f"  {r.get('part')}: {r.get('gammaUrl')}")
    print(
        "\nNächster Schritt in Gamma: Beide Teile öffnen — Teil 2-Inhalt in Teil 1 kopieren/einfügen,\n"
        "oder PPTX importieren für 1:1 Master: https://manuel-weiss.ch/onboarding/kickoff/valkeen-2026-master.pptx"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
