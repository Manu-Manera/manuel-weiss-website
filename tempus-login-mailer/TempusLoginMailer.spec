# -*- mode: python ; coding: utf-8 -*-
# PyInstaller-Spec für Tempus Login Mailer (macOS + Windows).
#
# Aufruf:
#   pyinstaller --noconfirm TempusLoginMailer.spec
#
# Produziert auf beiden Plattformen eine einzelne, ausführbare App, die man
# ohne Installation weitergeben kann.

import os
import sys
from pathlib import Path

from PyInstaller.utils.hooks import collect_all, collect_data_files

APP_NAME = "TempusLoginMailer"
IS_MAC = sys.platform == "darwin"
IS_WIN = sys.platform.startswith("win")

block_cipher = None

datas = []
binaries = []
hiddenimports = []

# Module, deren Assets und dynamische Imports eingebunden werden müssen,
# damit das Bundle ohne Python-Installation läuft.
for mod in ("customtkinter", "mammoth", "docx", "openpyxl"):
    try:
        m_data, m_bin, m_hidden = collect_all(mod)
        datas += m_data
        binaries += m_bin
        hiddenimports += m_hidden
    except Exception:
        pass

# Eigene Daten (Default-Template, Starter-Vorlagen, Workflow-Doku).
for folder in ("assets", "templates", "docs/workflow"):
    p = Path(folder)
    if p.exists():
        for file in p.rglob("*"):
            if file.is_file():
                datas.append((str(file), str(file.parent)))

a = Analysis(
    ["main.py"],
    pathex=[os.path.abspath(".")],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name=APP_NAME,
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=False,
    disable_windowed_traceback=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name=APP_NAME,
)

if IS_MAC:
    app = BUNDLE(
        coll,
        name=f"{APP_NAME}.app",
        icon=None,
        bundle_identifier="com.valkeen.tempus.loginmailer",
        info_plist={
            "NSHighResolutionCapable": True,
            "LSApplicationCategoryType": "public.app-category.productivity",
            "CFBundleShortVersionString": "1.0.0",
            "CFBundleVersion": "1.0.0",
        },
    )
