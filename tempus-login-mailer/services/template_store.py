"""
User-managed email templates: each template is a folder with template.json + body file.
Edit in Finder / Editor; the app loads files and fills placeholders.
"""

from __future__ import annotations

import base64
import json
import mimetypes
import re
import shutil
import zipfile
from dataclasses import dataclass
from pathlib import Path

from .template_engine import DEFAULT_SUBJECT, fill_template, placeholder_token_map

CONFIG_NAME = "template.json"
BODY_CANDIDATES = ("body.html", "body.htm", "body.txt", "body.docx")

DOCX_BODY_EDITOR_HINT = """[Word-Vorlage]

Der E-Mailtext liegt als Word-Datei vor (siehe template.json → body_file).

Bearbeiten Sie das Dokument in Microsoft Word:
• Tab „2. Vorlage“ → „Ordner öffnen“ oder Finder: templates/<Ordnername>/
• Datei öffnen, ändern, in Word speichern.

Im Fließtext exakt diese Platzhalter verwenden (geschweifte Klammern, Großbuchstaben):
{NAME}     Anzeigename
{EMAIL}    E-Mail-Adresse
{URL}      Login-URL
{USERNAME} Benutzername
{PASSWORD} Passwort

Danach in dieser App die Vorlage kurz neu wählen oder Tab „Bearbeiten“ → „Zurücksetzen“,
damit Vorschau und Versand den aktuellen Word-Stand nutzen.

„Speichern“ im Tab Bearbeiten schreibt nur Titel und Betreff (template.json), nicht die .docx-Datei.
"""


@dataclass
class EmailTemplate:
    """A template loaded from disk."""

    id: str
    title: str
    subject: str
    body_path: Path
    root: Path
    is_html: bool
    is_docx: bool


def templates_root(app_dir: Path | None = None) -> Path:
    base = app_dir or Path(__file__).resolve().parent.parent
    return base / "templates"


def _read_json(path: Path) -> dict:
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def list_templates(app_dir: Path | None = None) -> list[EmailTemplate]:
    root = templates_root(app_dir)
    if not root.is_dir():
        return []

    out: list[EmailTemplate] = []
    for sub in sorted(root.iterdir(), key=lambda p: p.name.lower()):
        if not sub.is_dir() or sub.name.startswith("."):
            continue
        cfg = _read_json(sub / CONFIG_NAME)
        body_file = cfg.get("body_file")
        body_path: Path | None = None
        if body_file:
            cand = sub / str(body_file)
            if cand.is_file():
                body_path = cand
        if body_path is None:
            for name in BODY_CANDIDATES:
                cand = sub / name
                if cand.is_file():
                    body_path = cand
                    break
        if body_path is None:
            continue

        ext = body_path.suffix.lower()
        is_docx = ext == ".docx"
        is_html = ext in (".html", ".htm") or is_docx

        title = str(cfg.get("title") or sub.name.replace("_", " "))
        subject = str(cfg.get("subject") or DEFAULT_SUBJECT)

        out.append(
            EmailTemplate(
                id=sub.name,
                title=title,
                subject=subject,
                body_path=body_path,
                root=sub,
                is_html=is_html,
                is_docx=is_docx,
            )
        )
    return out


def load_body_raw(tpl: EmailTemplate) -> str:
    if tpl.is_docx:
        return DOCX_BODY_EDITOR_HINT
    return tpl.body_path.read_text(encoding="utf-8")


def inline_local_images(html: str, template_root: Path) -> str:
    """
    Replace src="relative.png" (local files only) with data-URIs for Outlook drafts.
    http(s) and data: URLs stay unchanged.
    """
    root = template_root.resolve()

    def replace_src(m: re.Match) -> str:
        quote = m.group(1)
        src = m.group(2).strip()
        if src.startswith(("http://", "https://", "data:", "cid:")):
            return m.group(0)
        try:
            path = (template_root / src).resolve()
        except (OSError, ValueError):
            return m.group(0)
        if not path.is_file():
            return m.group(0)
        if path != root and root not in path.parents:
            return m.group(0)
        mime, _ = mimetypes.guess_type(str(path))
        if not mime:
            mime = "application/octet-stream"
        b64 = base64.standard_b64encode(path.read_bytes()).decode("ascii")
        new_src = f"data:{mime};base64,{b64}"
        return f"src={quote}{new_src}{quote}"

    return re.sub(r"src\s*=\s*(['\"])([^'\"]+)\1", replace_src, html, flags=re.IGNORECASE)


def prepare_body(
    tpl: EmailTemplate,
    *,
    name: str,
    url: str,
    username: str,
    password: str,
    email: str = "",
) -> tuple[str, bool]:
    if tpl.is_docx:
        from .docx_template_io import docx_to_filled_html

        mapping = placeholder_token_map(
            name=name, url=url, username=username, password=password, email=email
        )
        html = docx_to_filled_html(tpl.body_path, mapping)
        html = inline_local_images(html, tpl.root)
        return html, True

    raw = tpl.body_path.read_text(encoding="utf-8")
    if tpl.body_path.suffix.lower() in (".html", ".htm"):
        raw = inline_local_images(raw, tpl.root)
    filled = fill_template(
        raw, name=name, url=url, username=username, password=password, email=email
    )
    return filled, tpl.body_path.suffix.lower() in (".html", ".htm")


DEFAULT_NEW_BODY_HTML = """<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8" /></head>
<body style="font-family: Calibri, 'Segoe UI', sans-serif; font-size: 11pt;">
<p>Hallo {NAME},</p>
<p>
  <strong>E-Mail:</strong> {EMAIL}<br />
  <strong>URL:</strong> <a href="{URL}">{URL}</a><br />
  <strong>Username:</strong> {USERNAME}<br />
  <strong>Password:</strong> {PASSWORD}
</p>
<p>Viele Grüße</p>
</body>
</html>
"""


def template_folder_is_valid(root: Path) -> bool:
    if (root / CONFIG_NAME).exists():
        return True
    return any((root / n).exists() for n in BODY_CANDIDATES)


def _write_template_meta(root: Path, *, title: str, subject: str, body_file: str) -> None:
    meta = {
        "title": (title or "").strip() or root.name,
        "subject": (subject or "").strip() or DEFAULT_SUBJECT,
        "body_file": body_file,
    }
    (root / CONFIG_NAME).write_text(
        json.dumps(meta, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def _normalize_zip_root(dest: Path) -> None:
    """If ZIP contained a single top-level folder, move its contents up to dest."""
    entries = [p for p in dest.iterdir() if p.name not in (".DS_Store", "__MACOSX")]
    if len(entries) != 1 or not entries[0].is_dir():
        return
    inner = entries[0]
    for child in inner.iterdir():
        shutil.move(str(child), dest / child.name)
    inner.rmdir()


def save_template_metadata(tpl: EmailTemplate, *, title: str, subject: str) -> None:
    """Nur template.json (Titel/Betreff), body-Datei unverändert."""
    cfg = _read_json(tpl.root / CONFIG_NAME)
    body_file = str(cfg.get("body_file") or tpl.body_path.name)
    _write_template_meta(tpl.root, title=title, subject=subject, body_file=body_file)


def save_template_bundle(tpl: EmailTemplate, *, title: str, subject: str, body: str) -> None:
    if tpl.is_docx:
        save_template_metadata(tpl, title=title, subject=subject)
        return
    tpl.body_path.write_text(body, encoding="utf-8")
    _write_template_meta(
        tpl.root,
        title=title,
        subject=subject,
        body_file=tpl.body_path.name,
    )


def create_new_template_folder(
    app_dir: Path,
    slug: str,
    *,
    title: str | None = None,
    subject: str | None = None,
) -> Path:
    return create_template_with_html_body(
        app_dir,
        slug,
        body_html=DEFAULT_NEW_BODY_HTML,
        title=title,
        subject=subject,
    )


def create_template_with_html_body(
    app_dir: Path,
    slug: str,
    *,
    body_html: str,
    title: str | None = None,
    subject: str | None = None,
) -> Path:
    """Neuer Vorlagenordner mit beliebigem HTML-Body (für UI-Assistent)."""
    root = templates_root(app_dir) / slug
    if root.exists():
        raise FileExistsError(slug)
    root.mkdir(parents=True)
    body_path = root / "body.html"
    body_path.write_text(body_html or DEFAULT_NEW_BODY_HTML, encoding="utf-8")
    meta = {
        "title": title or slug.replace("_", " ").replace("-", " ").title(),
        "subject": subject or DEFAULT_SUBJECT,
        "body_file": "body.html",
    }
    (root / CONFIG_NAME).write_text(
        json.dumps(meta, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return root


def import_body_file_into_template(tpl: EmailTemplate, src: Path) -> None:
    """Ersetzt die Body-Datei der Vorlage durch die gewählte Datei (HTML/Text oder Word)."""
    cfg = _read_json(tpl.root / CONFIG_NAME)
    title = str(cfg.get("title") or tpl.title)
    subject = str(cfg.get("subject") or tpl.subject)

    suf = src.suffix.lower()
    if suf == ".docx":
        dest = tpl.root / "body.docx"
        shutil.copy2(src, dest)
        _write_template_meta(
            tpl.root,
            title=title,
            subject=subject,
            body_file=dest.name,
        )
        return
    text = src.read_text(encoding="utf-8", errors="replace")
    if tpl.body_path.suffix.lower() == ".docx":
        dest = tpl.root / ("body.html" if suf in (".html", ".htm") else "body.txt")
        dest.write_text(text, encoding="utf-8")
        _write_template_meta(
            tpl.root,
            title=title,
            subject=subject,
            body_file=dest.name,
        )
    else:
        tpl.body_path.write_text(text, encoding="utf-8")


def copy_images_into_template(tpl: EmailTemplate, paths: list[Path], subdir: str = "bilder") -> list[str]:
    """
    Copy image files into tpl.root/subdir. Returns relative paths (POSIX) for use in <img src="...">.
    """
    dest_dir = tpl.root / subdir
    dest_dir.mkdir(parents=True, exist_ok=True)
    rels: list[str] = []
    for p in paths:
        if not p.is_file():
            continue
        dest = dest_dir / p.name
        stem, suf = dest.stem, dest.suffix
        n = 1
        while dest.exists():
            dest = dest_dir / f"{stem}_{n}{suf}"
            n += 1
        shutil.copy2(p, dest)
        rels.append(f"{subdir}/{dest.name}".replace("\\", "/"))
    return rels


def import_template_zip(app_dir: Path, zip_path: Path, folder_name: str) -> Path:
    """
    Extract a ZIP into templates/<folder_name>. Expects body.html / template.json (possibly one nested folder).
    """
    dest = templates_root(app_dir) / folder_name
    if dest.exists():
        raise FileExistsError(folder_name)
    dest.mkdir(parents=True)
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(dest)
    _normalize_zip_root(dest)
    if not template_folder_is_valid(dest):
        shutil.rmtree(dest, ignore_errors=True)
        raise ValueError(
            "ZIP enthält keine gültige Vorlage (template.json oder body.html / body.txt / body.docx)."
        )
    return dest


def create_new_template_from_docx(
    app_dir: Path,
    slug: str,
    docx_src: Path,
    *,
    title: str | None = None,
    subject: str | None = None,
) -> Path:
    """Neuer Vorlagenordner mit body.docx (Kopie der gewählten Word-Datei)."""
    root = templates_root(app_dir) / slug
    if root.exists():
        raise FileExistsError(slug)
    root.mkdir(parents=True)
    dest = root / "body.docx"
    shutil.copy2(docx_src, dest)
    meta = {
        "title": title or slug.replace("_", " ").replace("-", " ").title(),
        "subject": subject or DEFAULT_SUBJECT,
        "body_file": "body.docx",
    }
    (root / CONFIG_NAME).write_text(
        json.dumps(meta, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return root
