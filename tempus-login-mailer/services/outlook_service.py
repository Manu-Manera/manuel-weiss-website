import os
import re
import subprocess
import sys
import tempfile

from .template_store import EmailTemplate, prepare_body


_CC_SPLIT = re.compile(r"[;,\s]+")


def parse_cc_addresses(cc: str | list[str] | tuple[str, ...] | None) -> list[str]:
    """Ein CC-Eintrag kann als String (mit ,/;/Whitespace getrennt) oder Liste kommen."""
    if not cc:
        return []
    if isinstance(cc, (list, tuple)):
        raw = list(cc)
    else:
        raw = _CC_SPLIT.split(str(cc))
    out: list[str] = []
    for part in raw:
        p = (part or "").strip().strip("<>").strip('"').strip("'")
        if p and "@" in p and p not in out:
            out.append(p)
    return out


# Abwärtskompatibler Alias.
_split_cc = parse_cc_addresses


def _applescript_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')


def _create_email_macos(
    to_address: str, to_name: str, subject: str, body: str, is_html: bool, cc: list[str]
) -> None:
    """Create an Outlook draft on macOS. Body is written to a UTF-8 temp file to avoid AppleScript escaping issues."""
    escaped_subject = _applescript_escape(subject)
    escaped_name = _applescript_escape(to_name)
    escaped_addr = _applescript_escape(to_address)

    suffix = ".html" if is_html else ".txt"
    fd, tmp_path = tempfile.mkstemp(suffix=suffix, prefix="tempus_mailer_")
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as f:
            f.write(body)

        posix = _applescript_escape(tmp_path)

        cc_lines = "\n".join(
            f'        make new cc recipient at newMsg with properties '
            f'{{email address:{{name:"{_applescript_escape(addr)}", address:"{_applescript_escape(addr)}"}}}}'
            for addr in cc
        )

        script = f'''
        set fp to POSIX file "{posix}"
        set msgBody to read fp as «class utf8»
        tell application "Microsoft Outlook"
            set newMsg to make new outgoing message with properties {{subject:"{escaped_subject}", content:msgBody}}
            make new recipient at newMsg with properties {{email address:{{name:"{escaped_name}", address:"{escaped_addr}"}}}}
{cc_lines}
            open newMsg
        end tell
        '''

        subprocess.run(["osascript", "-e", script], check=True, capture_output=True, text=True)
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


def _create_email_windows(
    to_address: str, to_name: str, subject: str, body: str, is_html: bool, cc: list[str]
) -> None:
    import win32com.client  # type: ignore[import-not-found]

    outlook = win32com.client.Dispatch("Outlook.Application")
    mail = outlook.CreateItem(0)
    mail.To = to_address
    if cc:
        mail.CC = "; ".join(cc)
    mail.Subject = subject
    if is_html:
        mail.HTMLBody = body
        mail.BodyFormat = 2  # olFormatHTML
    else:
        mail.Body = body
    mail.Display(False)


def create_draft_email(
    to_address: str,
    to_name: str,
    subject: str,
    body: str,
    *,
    is_html: bool = False,
    cc: str | list[str] | None = None,
) -> None:
    cc_list = _split_cc(cc)
    if sys.platform == "darwin":
        _create_email_macos(to_address, to_name, subject, body, is_html, cc_list)
    elif sys.platform == "win32":
        _create_email_windows(to_address, to_name, subject, body, is_html, cc_list)
    else:
        raise RuntimeError(f"Unsupported platform: {sys.platform}")


def create_batch_emails(
    entries: list[dict[str, str]],
    subject_template: str,
    tpl: EmailTemplate,
    on_progress: callable | None = None,
    *,
    cc: str | list[str] | None = None,
) -> tuple[int, list[str]]:
    """
    Create draft emails for all entries using a disk-based template.
    Returns (success_count, list_of_errors).
    """
    from .template_engine import fill_subject

    success = 0
    errors = []
    cc_list = _split_cc(cc)

    for i, entry in enumerate(entries):
        try:
            filled_body, is_html = prepare_body(
                tpl,
                name=entry.get("name", ""),
                url=entry.get("url", ""),
                username=entry.get("username", ""),
                password=entry.get("password", ""),
                email=entry.get("email", ""),
            )
            filled_subject = fill_subject(
                subject_template,
                name=entry.get("name", ""),
                url=entry.get("url", ""),
                username=entry.get("username", ""),
                password=entry.get("password", ""),
                email=entry.get("email", ""),
            )

            create_draft_email(
                to_address=entry.get("email", ""),
                to_name=entry.get("name", ""),
                subject=filled_subject,
                body=filled_body,
                is_html=is_html,
                cc=cc_list,
            )
            success += 1

        except Exception as e:
            errors.append(f"{entry.get('email', '?')}: {e}")

        if on_progress:
            on_progress(i + 1, len(entries))

    return success, errors
