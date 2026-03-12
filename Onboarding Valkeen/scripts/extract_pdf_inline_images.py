#!/usr/bin/env python3
"""
Analysiert das Tempus PDF: TOC, eingebettete Bilder, Seitenstruktur.
"""
import fitz  # pymupdf
from pathlib import Path

PDF_PATH = Path.home() / "Downloads" / "10.0 Consolidated User Training_Resource Manager_SHS IT (2).pdf"
OUT_DIR = Path(__file__).resolve().parent.parent / "docs" / "screenshots"

def main():
    if not PDF_PATH.exists():
        print(f"PDF nicht gefunden: {PDF_PATH}")
        return

    doc = fitz.open(PDF_PATH)
    
    # 1. Inhaltsverzeichnis (TOC)
    toc = doc.get_toc()
    print("=== INHALTSVERZEICHNIS (TOC) ===")
    for item in toc:
        level, title, page = item
        indent = "  " * (level - 1)
        print(f"{indent}[S.{page}] {title}")
    
    # 2. Eingebettete Bilder pro Seite (kleine Screenshot-Ausschnitte)
    print("\n=== EINGEBETTETE BILDER PRO SEITE ===")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    seen_xrefs = set()
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        image_list = page.get_images(full=True)
        
        for img_index, img in enumerate(image_list):
            xref = img[0]
            if xref in seen_xrefs:
                continue
            seen_xrefs.add(xref)
            
            try:
                base_image = doc.extract_image(xref)
                w, h = base_image["width"], base_image["height"]
                # Nur Bilder die wie Screenshots aussehen (nicht zu klein, nicht riesig)
                if w >= 100 and h >= 80 and w <= 2000:
                    ext = base_image["ext"]
                    out_name = f"inline_p{page_num+1}_{img_index}.{ext}"
                    out_path = OUT_DIR / out_name
                    with open(out_path, "wb") as f:
                        f.write(base_image["image"])
                    print(f"  Seite {page_num+1}: {out_name} ({w}x{h})")
            except Exception as e:
                pass
    
    doc.close()

if __name__ == "__main__":
    main()
