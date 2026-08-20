#!/usr/bin/env python3
"""Schreibt die heutigen Exchange-Termine (Apple Kalender) nach DynamoDB.

Der Feierabend-Check in AWS liest diesen Stand und schlägt Zeiteinträge vor.
"""

from __future__ import annotations

import json
import sys
from datetime import date, datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path.home() / "Valkeen/scripts/email_assistant"))

import boto3  # noqa: E402
import zeit_vorschlaege  # noqa: E402

TABLE = "task-suggestions"
REGION = "eu-central-1"


def main() -> int:
    today = date.today().isoformat()
    try:
        events = zeit_vorschlaege.get_calendar_events(date.fromisoformat(today))
    except Exception as exc:
        print(f"Kalender lesen fehlgeschlagen: {exc}", file=sys.stderr)
        return 1

    payload = [
        {
            "date": today,
            "title": ev["title"],
            "start": ev["start"],
            "end": ev["end"],
            "hours": round(float(ev["hours"]), 2),
        }
        for ev in events
    ]

    client = boto3.client("dynamodb", region_name=REGION)
    client.put_item(
        TableName=TABLE,
        Item={
            "pk": {"S": "CALENDAR"},
            "sk": {"S": today},
            "day": {"S": today},
            "updatedAt": {"S": datetime.now(timezone.utc).isoformat()},
            "source": {"S": "apple-calendar"},
            "count": {"N": str(len(payload))},
            "events": {"S": json.dumps(payload, ensure_ascii=False)},
        },
    )
    print(f"Kalender → AWS: {len(payload)} Termin(e) für {today}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
