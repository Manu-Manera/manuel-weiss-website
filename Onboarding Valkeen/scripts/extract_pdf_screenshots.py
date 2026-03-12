#!/usr/bin/env python3
"""
Extrahiert Screenshots aus dem Tempus Resource Manager User Training PDF.
Verwendet pymupdf um Seiten als PNG zu rendern.
"""
import fitz  # pymupdf
import os
from pathlib import Path

PDF_PATH = Path.home() / "Downloads" / "10.0 Consolidated User Training_Resource Manager_SHS IT (2).pdf"
OUT_DIR = Path(__file__).resolve().parent.parent / "docs" / "screenshots"

# Mapping: Kapitel/Platzhalter -> PDF-Seitennummern (0-basiert)
# Basierend auf typischer Struktur: Kapitel 0~1 S.1-5, Kap 2 S.6-8, Kap 3 S.9-12, etc.
CHAPTER_PAGES = {
    "kapitel0_homepage": [0, 1],           # Übersicht, Homepage
    "kapitel1_homepage": [2, 3],          # Anmeldung, Tiles
    "kapitel2_subscriptions": [4, 5],      # Subscriptions
    "kapitel3_resource_grid": [6, 7, 8],   # Resource Management Grid
    "kapitel4_net_availability": [9, 10], # Net Availability
    "kapitel5_resource_request": [11, 12], # Resource Request Screen
    "kapitel6_allocation_grid": [13, 14], # Single Project Allocation
    "kapitel7_nonproject": [15],          # Non-Project Activities
    "kapitel8_bpa_flatgrid": [16, 17],    # BPA Flatgrid
    "kapitel9_reports": [18],             # Reports
}

def main():
    if not PDF_PATH.exists():
        print(f"PDF nicht gefunden: {PDF_PATH}")
        return False

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(PDF_PATH)
    total = len(doc)
    print(f"PDF hat {total} Seiten")

    # Erste Seite jeder relevanten Sektion rendern (repräsentativster Screenshot)
    rendered = {}
    for key, pages in CHAPTER_PAGES.items():
        page_num = pages[0]  # Erste Seite der Sektion
        if page_num >= total:
            continue
        page = doc[page_num]
        mat = fitz.Matrix(2.0, 2.0)  # 2x zoom für bessere Qualität
        pix = page.get_pixmap(matrix=mat, alpha=False)
        out_path = OUT_DIR / f"{key}.png"
        pix.save(str(out_path))
        rendered[key] = out_path.name
        print(f"  {key} -> Seite {page_num+1} -> {out_path.name}")

    doc.close()
    print(f"\n{len(rendered)} Screenshots in {OUT_DIR}")
    return True

if __name__ == "__main__":
    main()
