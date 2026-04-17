from pathlib import Path

_ASSETS_DIR = Path(__file__).resolve().parent.parent / "assets"
DEFAULT_TEMPLATE_PATH = _ASSETS_DIR / "default_template.txt"

DEFAULT_SUBJECT = "Tempus Logins + Password Update Instructions"

PLACEHOLDERS = {
    "{NAME}": "Name (Anzeige)",
    "{EMAIL}": "E-Mail-Adresse",
    "{URL}": "Login-URL",
    "{USERNAME}": "Benutzername",
    "{PASSWORD}": "Passwort",
}


def load_default_template() -> str:
    if DEFAULT_TEMPLATE_PATH.exists():
        return DEFAULT_TEMPLATE_PATH.read_text(encoding="utf-8")
    return (
        "Hello {NAME},\n\n"
        "URL: {URL}\nUsername: {USERNAME}\nPassword: {PASSWORD}\n\n"
        "Many thanks"
    )


def placeholder_token_map(
    *,
    name: str,
    url: str,
    username: str,
    password: str,
    email: str = "",
) -> dict[str, str]:
    """Ersetzungswerte für {NAME}, {EMAIL}, … (Word und HTML/Text)."""
    return {
        "{NAME}": name or "",
        "{EMAIL}": email or "",
        "{URL}": url or "",
        "{USERNAME}": username or "",
        "{PASSWORD}": password or "",
    }


def fill_template(
    template: str,
    *,
    name: str,
    url: str,
    username: str,
    password: str,
    email: str = "",
) -> str:
    """Replace placeholders in the template with actual values."""
    result = template
    for key, val in placeholder_token_map(
        name=name, url=url, username=username, password=password, email=email
    ).items():
        result = result.replace(key, val)
    return result


def fill_subject(
    subject: str,
    *,
    name: str,
    url: str,
    username: str,
    password: str,
    email: str = "",
) -> str:
    """Replace placeholders in the subject line (in case user uses them)."""
    return fill_template(
        subject, name=name, url=url, username=username, password=password, email=email
    )
