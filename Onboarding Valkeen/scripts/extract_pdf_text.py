#!/usr/bin/env python3
"""
Extrahiert Text aus dem Tempus Resource Manager PDF pro Kapitel.
Output: JSON mit kapitelweise strukturiertem Text.
"""
import fitz
import json
from pathlib import Path

PDF_PATH = Path.home() / "Downloads" / "10.0 Consolidated User Training_Resource Manager_SHS IT (2).pdf"
OUT_JSON = Path(__file__).resolve().parent.parent / "docs" / "pdf_extracted_text.json"

# Seite -> Kapitel (1-basiert)
PAGE_TO_CHAPTER = {
    5: "overview",
    6: "shortcuts",
    7: "login",
    8: "homepage_tiles",
    9: "homepage_tiles",
    10: "subscriptions",
    11: "resource_grid",
    12: "resource_grid",
    13: "resource_grid",
    14: "resource_grid",
    15: "resource_grid",
    16: "resource_grid",
    17: "net_availability",
    18: "net_availability",
    19: "net_availability",
    20: "resource_requests",
    21: "resource_requests",
    22: "resource_requests",
    23: "resource_requests",
    24: "creating_requests",
    25: "creating_requests",
    26: "nonproject",
    27: "nonproject",
    28: "nonproject",
    29: "bpa_flatgrid",
    30: "bpa_flatgrid",
    31: "bpa_flatgrid",
    32: "bpa_flatgrid",
    33: "bpa_flatgrid",
    34: "bpa_flatgrid",
    35: "bpa_flatgrid",
    36: "bpa_flatgrid",
    37: "reports",
}

def clean_text(t):
    t = t.strip()
    t = " ".join(t.split())
    return t

def main():
    if not PDF_PATH.exists():
        print(f"PDF nicht gefunden: {PDF_PATH}")
        return

    doc = fitz.open(PDF_PATH)
    chapters = {}

    for page_num in range(len(doc)):
        ch = PAGE_TO_CHAPTER.get(page_num + 1)
        if not ch:
            continue
        page = doc[page_num]
        text = page.get_text()
        text = clean_text(text)
        # Header/Footer entfernen (Valkeen, Page X of 37, etc.)
        lines = text.split("\n")
        filtered = []
        for line in lines:
            line = line.strip()
            if not line:
                continue
            if "Page " in line and " of " in line:
                continue
            if "Valkeen GmbH" in line or "www.valkeen.com" in line:
                continue
            if "CONFIDENTIALITY" in line or "User Guide" in line:
                continue
            filtered.append(line)
        text = "\n".join(filtered)
        if ch not in chapters:
            chapters[ch] = []
        if text and len(text) > 50:
            chapters[ch].append(text)

    doc.close()

    # Pro Kapitel: Text zusammenführen, Duplikate reduzieren
    result = {}
    for ch, texts in chapters.items():
        merged = "\n\n".join(texts[:3])  # Max 3 Blöcke pro Kapitel
        result[ch] = merged[:2000] if len(merged) > 2000 else merged  # Kürzen

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"Text extrahiert -> {OUT_JSON}")
    return result

if __name__ == "__main__":
    main()
