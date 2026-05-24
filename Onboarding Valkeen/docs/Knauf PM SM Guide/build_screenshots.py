"""Generate annotated screenshots and inline detail crops for the PM/SM guide.

Source screenshots live in ``screenshots/`` (raw captures from the Knauf PM/SM
sandbox). This script produces two extra families of derived images:

1. ``screenshots/annotated/<name>_annot.png`` – the same screenshot with yellow
   numbered highlight boxes on the buttons / fields referenced in the guide.
2. ``screenshots/details/<name>_<crop>.png`` – small zoomed crops used inline
   in the body text (e.g. just the Toolbar, just the Save button, etc.).

All coordinates were measured manually against the 1024×924 PM/SM captures
taken on 2026-05-11 from ``knaufdev.tempus-resource.com``. Re-run this script
after refreshing the raw screenshots; the SHA of each derived file changes
deterministically.
"""

from __future__ import annotations

import sys
from pathlib import Path


HERE = Path(__file__).resolve().parent
SHOTS = HERE / "screenshots"
ANNOT = SHOTS / "annotated"
DETAIL = SHOTS / "details"


sys.path.insert(0, str((HERE.parent / "_tempus-assets" / "_tools").resolve()))
from annotate import annotate, crop_and_save  # type: ignore


# --------------------------------------------------------------------------- #
# 02 – Project Management Grid: annotate toolbar steps + crop toolbar / tabs  #
# --------------------------------------------------------------------------- #


def grid_02() -> None:
    src = SHOTS / "02_grid_pmsm.png"
    annotate(
        src,
        ANNOT / "02_grid_pmsm_annot.png",
        rects=[
            {"box": (727, 65, 980, 115), "label": "1"},   # Kanban / Grid / Gantt tabs
            {"box": (95, 125, 235, 175), "label": "2"},   # Create Project
            {"box": (407, 125, 575, 175), "label": "3"},  # Search
            {"box": (586, 125, 745, 175), "label": "4"},  # Filter + Columns
            {"box": (756, 125, 885, 175), "label": "5"},  # Group by
            {"box": (893, 125, 980, 175), "label": "6"},  # Default view button
        ],
    )
    # Detail crops
    crop_and_save(src, DETAIL / "02_toolbar_strip.png", (35, 125, 980, 175))
    crop_and_save(src, DETAIL / "02_tabs_strip.png", (725, 65, 980, 115))


# --------------------------------------------------------------------------- #
# 03 – Create Project, Intake Form: highlight Type/Service Name and Save     #
# --------------------------------------------------------------------------- #


def create_intake_03() -> None:
    src = SHOTS / "03_create_intake.png"
    annotate(
        src,
        ANNOT / "03_create_intake_annot.png",
        rects=[
            {"box": (70, 70, 365, 115), "label": "1"},     # Project name input
            {"box": (282, 70, 340, 115), "label": "2"},    # Create button
            {"box": (98, 200, 470, 230), "label": "3"},    # Type field
            {"box": (500, 200, 905, 230), "label": "4"},   # Service Name (n/a for regular)
            {"box": (60, 705, 905, 740), "label": "5"},    # Project Manager
        ],
    )
    crop_and_save(src, DETAIL / "03_create_header.png", (40, 60, 985, 130))


# --------------------------------------------------------------------------- #
# 04 – PMO section: highlight Ext. Project Number and WBS                    #
# --------------------------------------------------------------------------- #


def create_pmo_04() -> None:
    src = SHOTS / "04_create_pmo.png"
    annotate(
        src,
        ANNOT / "04_create_pmo_annot.png",
        rects=[
            {"box": (60, 600, 905, 645), "label": "1"},   # Above Red Line
            {"box": (60, 648, 905, 685), "label": "2"},   # Portfolio Status
            {"box": (60, 730, 935, 780), "label": "3"},   # Ext. Project Number + UNIQUE badge
            {"box": (60, 780, 905, 820), "label": "4"},   # Project Identifier Code (WBS)
        ],
    )
    crop_and_save(src, DETAIL / "04_pmo_section.png", (40, 545, 985, 830))
    crop_and_save(src, DETAIL / "04_unique_badge.png", (855, 735, 920, 770))


# --------------------------------------------------------------------------- #
# 05 – Attributes view: highlight Save button, sections                      #
# --------------------------------------------------------------------------- #


def attributes_05() -> None:
    src = SHOTS / "05_attributes.png"
    annotate(
        src,
        ANNOT / "05_attributes_annot.png",
        rects=[
            {"box": (60, 65, 235, 115), "label": "1"},     # Project name field
            {"box": (255, 65, 365, 115), "label": "2", "color": "red"},  # Save (red highlight)
            {"box": (780, 65, 905, 115), "label": "3"},    # View selector (Attributes)
        ],
    )
    crop_and_save(src, DETAIL / "05_attr_topbar.png", (40, 55, 985, 130))
    crop_and_save(src, DETAIL / "05_save_button.png", (250, 65, 365, 115))


# --------------------------------------------------------------------------- #
# 06 + 07 – Allocations Mandays / Cost: highlight Checkout + Mode selector   #
# --------------------------------------------------------------------------- #


def allocations_06() -> None:
    src = SHOTS / "06_allocations_manday.png"
    annotate(
        src,
        ANNOT / "06_allocations_manday_annot.png",
        rects=[
            {"box": (60, 65, 235, 115), "label": "1"},                   # Project name
            {"box": (255, 65, 365, 115), "label": "2", "color": "red"},  # Checkout button
            {"box": (755, 65, 905, 115), "label": "3"},                  # View selector
            {"box": (495, 235, 895, 280), "label": "4"},                 # Mandays / Cost mode toggle
        ],
    )
    crop_and_save(src, DETAIL / "06_alloc_toolbar.png", (35, 55, 985, 130))


def allocations_07() -> None:
    src = SHOTS / "07_allocations_cost.png"
    annotate(
        src,
        ANNOT / "07_allocations_cost_annot.png",
        rects=[
            {"box": (595, 235, 670, 280), "label": "1"},   # € Cost active
            {"box": (855, 175, 970, 220), "label": "2"},   # Month grain selector
        ],
    )
    crop_and_save(src, DETAIL / "07_view_toggle.png", (495, 230, 985, 285))


# --------------------------------------------------------------------------- #
# 08 – Financials                                                            #
# --------------------------------------------------------------------------- #


def financials_08() -> None:
    src = SHOTS / "08_financials.png"
    annotate(
        src,
        ANNOT / "08_financials_annot.png",
        rects=[
            {"box": (255, 65, 365, 115), "label": "1", "color": "red"},  # Checkout / Save
            {"box": (700, 65, 850, 115), "label": "2"},                   # View selector (Financials)
            {"box": (35, 225, 510, 280), "label": "3"},                   # Time grain / Excel / Columns / Group by toolbar
            {"box": (35, 285, 985, 490), "label": "4"},                   # Cost grid with one row
        ],
    )


# --------------------------------------------------------------------------- #
# 09 – Reports                                                               #
# --------------------------------------------------------------------------- #


def reports_09() -> None:
    src = SHOTS / "09_reports.png"
    annotate(
        src,
        ANNOT / "09_reports_annot.png",
        rects=[
            {"box": (50, 130, 250, 180), "label": "1"},    # All / Mine toggle
            {"box": (400, 130, 700, 180), "label": "2"},   # Search
        ],
    )


# --------------------------------------------------------------------------- #


def main() -> None:
    ANNOT.mkdir(parents=True, exist_ok=True)
    DETAIL.mkdir(parents=True, exist_ok=True)
    for fn in (
        grid_02,
        create_intake_03,
        create_pmo_04,
        attributes_05,
        allocations_06,
        allocations_07,
        financials_08,
        reports_09,
    ):
        try:
            fn()
            print(f"[ok] {fn.__name__}")
        except Exception as exc:  # pragma: no cover
            print(f"[FAIL] {fn.__name__}: {exc}")


if __name__ == "__main__":
    main()
