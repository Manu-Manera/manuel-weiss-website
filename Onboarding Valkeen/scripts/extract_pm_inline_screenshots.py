#!/usr/bin/env python3
"""Extrahiert Inline-Screenshots aus dem Project Manager Training PDF."""
import fitz
from pathlib import Path

PDF_PATH = Path.home() / "Downloads" / "10.0 Consolidated User Training_Project Manager_SHS IT (1).pdf"
OUT_DIR = Path(__file__).resolve().parent.parent / "docs" / "screenshots" / "inline_pm"

PAGE_TO_CHAPTER = {
    5: "login",
    6: "homepage",
    7: "subscriptions",
    8: "project_grid",
    9: "project_grid",
    10: "single_project",
    11: "single_project",
    12: "single_project",
    13: "assignment_options",
    14: "resource_request_status",
    15: "bpa_flatgrid",
    16: "bpa_flatgrid",
    17: "bpa_flatgrid",
    18: "bpa_flatgrid",
    19: "bpa_flatgrid",
    20: "pending_requests",
}

def is_screenshot_size(w, h):
    return 150 <= w <= 1200 and 80 <= h <= 900

def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(PDF_PATH)
    seen_xrefs = set()
    chapter_images = {}

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
                fname = f"pm_{chapter}_p{page_num+1}_{img_index}.{ext}"
                out_path = OUT_DIR / fname
                with open(out_path, "wb") as f:
                    f.write(base["image"])
                if chapter not in chapter_images:
                    chapter_images[chapter] = []
                chapter_images[chapter].append((f"inline_pm/{fname}", w, h))
            except Exception:
                pass

    doc.close()
    print(f"Extrahierte {sum(len(v) for v in chapter_images.values())} Bilder nach {OUT_DIR}")
    for ch, imgs in sorted(chapter_images.items()):
        # Top 3 pro Kapitel
        imgs.sort(key=lambda x: -(x[1]*x[2]))
        for p in imgs[:3]:
            print(f"  {ch}: {p[0]}")

if __name__ == "__main__":
    main()
