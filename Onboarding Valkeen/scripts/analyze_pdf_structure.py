#!/usr/bin/env python3
"""
Extrahiert Textstruktur und Überschriften aus dem PDF für TOC.
"""
import fitz
from pathlib import Path

PDF_PATH = Path.home() / "Downloads" / "10.0 Consolidated User Training_Resource Manager_SHS IT (2).pdf"

def main():
    doc = fitz.open(PDF_PATH)
    
    # Text mit Block-Struktur für Überschriften
    for page_num in range(min(25, len(doc))):
        page = doc[page_num]
        blocks = page.get_text("dict")["blocks"]
        print(f"\n--- Seite {page_num+1} ---")
        for block in blocks:
            if "lines" in block:
                for line in block["lines"]:
                    for span in line["spans"]:
                        text = span["text"].strip()
                        size = span.get("size", 0)
                        if text and (size >= 14 or "Chapter" in text or "Kapitel" in text or 
                                     text.startswith("Logging") or text.startswith("Resource") or
                                     text.startswith("Net ") or text.startswith("Creating")):
                            print(f"  [{size:.0f}pt] {text[:80]}")
    
    doc.close()

if __name__ == "__main__":
    main()
