import re

USERNAME_MODE_FIRSTNAME = "firstname"
USERNAME_MODE_FULLNAME = "fullname"

DEFAULT_TEMPUS_PASSWORD = "Passwort123@Tempus"


def suggest_name_from_email(email: str) -> str:
    """Derive a human-readable name from an email address."""
    if not email or "@" not in email:
        return ""

    local_part = email.split("@")[0].strip().lower()

    for sep in [".", "_", "-"]:
        if sep in local_part:
            parts = [p for p in local_part.split(sep) if p]
            if len(parts) >= 2:
                return " ".join(p.capitalize() for p in parts)

    if len(local_part) > 2 and local_part[1:].isalpha():
        match = re.match(r"^([a-z])([a-z]+)$", local_part)
        if match:
            initial, surname = match.groups()
            if len(surname) >= 3:
                return f"{initial.upper()}. {surname.capitalize()}"

    return local_part.capitalize()


def suggest_names_batch(emails: list[str]) -> list[str]:
    return [suggest_name_from_email(e) for e in emails]


def _slug_login_token(s: str) -> str:
    """Lowercase login token: umlauts to ascii, only a-z0-9."""
    t = s.lower().strip()
    t = (
        t.replace("ä", "ae")
        .replace("ö", "oe")
        .replace("ü", "ue")
        .replace("ß", "ss")
    )
    return re.sub(r"[^a-z0-9]", "", t)


def format_username_proper_case(username: str) -> str:
    """
    First letter uppercase per part: 'leonie' -> 'Leonie', 'maria mueller' -> 'Maria Mueller',
    'maria.mueller' -> 'Maria.Mueller' (Punkt nur falls manuell so eingetragen).
    """
    if not username:
        return ""

    def cap(seg: str) -> str:
        if not seg:
            return seg
        return seg[0].upper() + seg[1:] if len(seg) > 1 else seg.upper()

    if "." in username:
        return ".".join(cap(p) for p in username.split(".") if p)
    if " " in username.strip():
        return " ".join(cap(p) for p in username.split() if p)
    return cap(username)


def suggest_username_from_display_name(display_name: str, mode: str) -> str:
    """
    Build a suggested username from the display name (e.g. from Excel or e-mail).

    mode: USERNAME_MODE_FIRSTNAME -> first word only (e.g. Leonie)
          USERNAME_MODE_FULLNAME   -> first last (e.g. Maria Mueller), first + last token, Leerzeichen
    """
    parts = [p for p in (display_name or "").strip().split() if p]
    if not parts:
        return ""

    tokens = [_slug_login_token(p) for p in parts]
    tokens = [t for t in tokens if t]
    if not tokens:
        return ""

    if mode == USERNAME_MODE_FIRSTNAME:
        raw = tokens[0]
    elif len(tokens) == 1:
        raw = tokens[0]
    else:
        raw = f"{tokens[0]} {tokens[-1]}"

    return format_username_proper_case(raw)
