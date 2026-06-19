#!/usr/bin/env python3
"""Extrahiert Folientexte aus Valkeen-2026-PPTX → valkeen-2026-master-manifest.json."""

import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'}


def texts_from_slide_xml(xml_bytes):
    root = ET.fromstring(xml_bytes)
    chunks = []
    for t in root.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t'):
        if t.text:
            chunks.append(t.text)
        if t.tail:
            chunks.append(t.tail)
    lines = []
    for part in re.split(r'[\n\r]+', ' '.join(chunks)):
        s = re.sub(r'\s+', ' ', part).strip()
        if s and s not in lines:
            lines.append(s)
    return lines


def build_manifest(pptx_path: Path):
    slides = []
    with zipfile.ZipFile(pptx_path) as z:
        names = sorted(
            n for n in z.namelist() if n.startswith('ppt/slides/slide') and n.endswith('.xml')
        )
        for i, name in enumerate(names, start=1):
            lines = texts_from_slide_xml(z.read(name))
            headline = lines[0] if lines else f'Slide {i}'
            slides.append({'index': i, 'headline': headline, 'lines': lines})
    return {
        'source': pptx_path.name,
        'slideCount': len(slides),
        'slides': slides,
    }


def main():
    if len(sys.argv) < 2:
        print('Usage: build-valkeen-2026-manifest.py <path-to.pptx>', file=sys.stderr)
        sys.exit(1)
    pptx = Path(sys.argv[1]).expanduser().resolve()
    out = Path(__file__).resolve().parents[1] / 'src/data/valkeen-2026-master-manifest.json'
    public_pptx = Path(__file__).resolve().parents[1] / 'public/kickoff/valkeen-2026-master.pptx'
    manifest = build_manifest(pptx)
    out.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    if pptx != public_pptx.resolve():
        public_pptx.write_bytes(pptx.read_bytes())
    print(f'Wrote {len(manifest["slides"])} slides → {out}')
    print(f'Copied PPTX → {public_pptx}')


if __name__ == '__main__':
    main()
