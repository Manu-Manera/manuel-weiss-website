"""Crop individual UI icons from full screenshots in the asset library.

Run from ``_tempus-assets/`` root. Reads the configured source screenshots and
writes small icon PNGs into ``icons/`` together with an ``index.json`` update.

Crop coordinates were determined manually by inspecting the source screenshots
captured against ``knaufdev.tempus-resource.com`` at 1024x924 viewport.

Re-run this script whenever the source screenshots are refreshed.
"""

from __future__ import annotations

import json
from collections import OrderedDict
from pathlib import Path

from PIL import Image


HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
INDEX_PATH = ROOT / "index.json"


def crop_box(src: Path, dst: Path, box: tuple[int, int, int, int]) -> None:
    with Image.open(src) as img:
        cropped = img.crop(box)
        dst.parent.mkdir(parents=True, exist_ok=True)
        cropped.save(dst, format="PNG", optimize=True)
        print(f"  -> {dst.name}  size={cropped.size}")


SOURCES = {
    "view_manager": ROOT / "chrome" / "chrome_view_manager_open.png",
    "homescreen_rm": ROOT / "screens" / "screen_homescreen_rm.png",
}


CROPS: dict[str, dict] = OrderedDict()


CROPS["icon_lock"] = {
    "source": "view_manager",
    "box": (658, 274, 692, 308),
    "scope": "generic",
    "source_label": "knaufdev.tempus-resource.com – View Manager (RM dummy)",
    "description": "Lock icon used to freeze a private view (changes do not persist).",
    "default_inline_height_pt": 12,
}
CROPS["icon_default_star_filled"] = {
    "source": "view_manager",
    "box": (697, 274, 722, 308),
    "scope": "generic",
    "source_label": "knaufdev.tempus-resource.com – View Manager (RM dummy)",
    "description": "Filled star: the currently selected default view for the screen.",
    "default_inline_height_pt": 12,
}
CROPS["icon_edit_pencil"] = {
    "source": "view_manager",
    "box": (880, 274, 909, 308),
    "scope": "generic",
    "source_label": "knaufdev.tempus-resource.com – View Manager (RM dummy)",
    "description": "Pencil icon to rename / edit the active view.",
    "default_inline_height_pt": 12,
}
CROPS["icon_clone"] = {
    "source": "view_manager",
    "box": (913, 274, 942, 308),
    "scope": "generic",
    "source_label": "knaufdev.tempus-resource.com – View Manager (RM dummy)",
    "description": "Copy / clone icon to duplicate a view (or any cloneable item).",
    "default_inline_height_pt": 12,
}
CROPS["icon_delete_trash"] = {
    "source": "view_manager",
    "box": (945, 274, 974, 308),
    "scope": "generic",
    "source_label": "knaufdev.tempus-resource.com – View Manager (RM dummy)",
    "description": "Trashcan icon to delete the view (private only — public views cannot be deleted).",
    "default_inline_height_pt": 12,
}
CROPS["icon_public_eye"] = {
    "source": "view_manager",
    "box": (658, 320, 692, 354),
    "scope": "generic",
    "source_label": "knaufdev.tempus-resource.com – View Manager (RM dummy)",
    "description": "Blue eye icon: marks a public (administratively shared) view. Always clone it before editing.",
    "default_inline_height_pt": 12,
}
CROPS["icon_default_star_outline"] = {
    "source": "view_manager",
    "box": (697, 320, 722, 354),
    "scope": "generic",
    "source_label": "knaufdev.tempus-resource.com – View Manager (RM dummy)",
    "description": "Outline star: click to make this view the default for this screen.",
    "default_inline_height_pt": 12,
}
CROPS["icon_drag_handle"] = {
    "source": "view_manager",
    "box": (635, 274, 656, 308),
    "scope": "generic",
    "source_label": "knaufdev.tempus-resource.com – View Manager (RM dummy)",
    "description": "Drag handle (8 dots) to reorder rows by drag-and-drop.",
    "default_inline_height_pt": 12,
}
CROPS["icon_tile_plus"] = {
    "source": "homescreen_rm",
    "box": (235, 175, 258, 198),
    "scope": "generic",
    "source_label": "knaufdev.tempus-resource.com – Homescreen (RM dummy)",
    "description": "Plus icon on a tile: quick-add (e.g. Create Project from the Project tile).",
    "default_inline_height_pt": 12,
}
CROPS["icon_topbar_bell"] = {
    "source": "homescreen_rm",
    "box": (665, 19, 695, 49),
    "scope": "generic",
    "source_label": "knaufdev.tempus-resource.com – Top bar",
    "description": "Bell icon: in-app notifications.",
    "default_inline_height_pt": 12,
}
CROPS["icon_topbar_help"] = {
    "source": "homescreen_rm",
    "box": (749, 19, 778, 49),
    "scope": "generic",
    "source_label": "knaufdev.tempus-resource.com – Top bar",
    "description": "Help icon: opens the Tempus Help Center in a new tab.",
    "default_inline_height_pt": 12,
}
CROPS["icon_topbar_menu"] = {
    "source": "homescreen_rm",
    "box": (707, 19, 736, 49),
    "scope": "generic",
    "source_label": "knaufdev.tempus-resource.com – Top bar",
    "description": "Hamburger / app menu icon.",
    "default_inline_height_pt": 12,
}
CROPS["icon_topbar_search"] = {
    "source": "homescreen_rm",
    "box": (622, 19, 651, 49),
    "scope": "generic",
    "source_label": "knaufdev.tempus-resource.com – Top bar",
    "description": "Global search icon (top bar).",
    "default_inline_height_pt": 12,
}
CROPS["chrome_create_view_dropdown"] = {
    "source": "view_manager",
    "box": (615, 170, 985, 410),
    "scope": "generic",
    "source_label": "knaufdev.tempus-resource.com – View Manager (RM dummy)",
    "description": "Full View Manager dropdown showing the 'Default' row icons and two public views below.",
    "default_inline_height_pt": 120,
    "target_subdir": "chrome",
}


def update_index(entries: dict) -> None:
    if INDEX_PATH.exists():
        data = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
    else:
        data = {"version": "1.0.0", "assets": {}}
    assets = data.get("assets", {}) or {}
    for name, meta in entries.items():
        target_subdir = meta.get("target_subdir", "icons")
        rel_file = f"{target_subdir}/{name}.png"
        assets[name] = {
            "file": rel_file,
            "scope": meta["scope"],
            "source": meta["source_label"],
            "description": meta["description"],
            "default_inline_height_pt": meta["default_inline_height_pt"],
        }
    data["assets"] = OrderedDict(sorted(assets.items()))
    INDEX_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Updated {INDEX_PATH.relative_to(ROOT)} ({len(assets)} assets total).")


def main() -> None:
    for name, meta in CROPS.items():
        source_key = meta["source"]
        src = SOURCES[source_key]
        if not src.exists():
            print(f"[skip] source missing for {name}: {src}")
            continue
        subdir = meta.get("target_subdir", "icons")
        dst = ROOT / subdir / f"{name}.png"
        print(f"[crop] {name} from {src.name}")
        crop_box(src, dst, meta["box"])
    update_index(CROPS)


if __name__ == "__main__":
    main()
