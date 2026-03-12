#!/usr/bin/env python3
"""
Extrahiert eingebettete Screenshot-Ausschnitte und mappt sie auf Kapitel.
TOC aus PDF Seite 3-4.
"""
import fitz
from pathlib import Path

PDF_PATH = Path.home() / "Downloads" / "10.0 Consolidated User Training_Resource Manager_SHS IT (2).pdf"
OUT_DIR = Path(__file__).resolve().parent.parent / "docs" / "screenshots" / "inline"

# Seite -> Kapitel (0=Overview, 1=Login, 2=Subscriptions, 3=Resource Grid, etc.)
PAGE_TO_CHAPTER = {
    1: "overview",
    5: "overview",
    6: "shortcuts",
    7: "login",
    8: "homepage",
    9: "homepage",
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

# Pro Kapitel: max. 2-3 repräsentative Bilder (mittlere Größe, sinnvolle Screenshots)
def is_screenshot_size(w, h):
    return 150 <= w <= 1200 and 80 <= h <= 900

def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(PDF_PATH)
    seen_xrefs = set()
    chapter_images = {}  # chapter -> list of (filename, w, h)
    
    for page_num in range(len(doc)):
        chapter = PAGE_TO_CHAPTER.get(page_num + 1, "other")
        page = doc[page_num]
        image_list = page.get_images(full=True)
        
        for img_index, img in enumerate(image_list):
            xref = img[0]
            if xref in seen_xrefs:
                continue
            seen_xrefs.add(xref)
            
            try:
                base = doc.extract_image(xref)
                w, h = base["width"], base["height"]
                if not is_screenshot_size(w, h):
                    continue
                ext = base["ext"]
                if ext == "jpeg":
                    ext = "jpg"
                fname = f"{chapter}_p{page_num+1}_{img_index}.{ext}"
                out_path = OUT_DIR / fname
                with open(out_path, "wb") as f:
                    f.write(base["image"])
                if chapter not in chapter_images:
                    chapter_images[chapter] = []
                chapter_images[chapter].append((f"inline/{fname}", w, h))
            except Exception:
                pass
    
    doc.close()
    
    # Mapping für HTML: chapter_key -> list of image paths
    print("CHAPTER_IMAGES = {")
    for ch, imgs in sorted(chapter_images.items()):
        # Max 3 pro Kapitel, sortiert nach Fläche (größere = wichtiger)
        imgs.sort(key=lambda x: -(x[1]*x[2]))
        imgs = imgs[:3]
        paths = [f'screenshots/{p[0]}' for p in imgs]
        print(f"    '{ch}': {paths},")
    print("}")
    return chapter_images

if __name__ == "__main__":
    main()
