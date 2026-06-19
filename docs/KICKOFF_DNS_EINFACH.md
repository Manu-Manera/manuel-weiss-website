# Kick-off Studio — kurze Kunden-URLs (AWS)

## Ziel-URL (kürzest)

```text
https://shs.impl.manuel-weiss.ch/?s=kickoff-…
```

| Teil | Bedeutung |
|------|-----------|
| `shs` | Siemens Healthineers (weitere: `hzn`, `knf`) |
| `impl.manuel-weiss.ch` | Kick-off-Subdomain (**impl** = Implementierung) |
| `?s=` | Session-ID (statt langer Pfad + `session=`) |

Gleicher S3-Bucket und CloudFront wie `manuel-weiss.ch`.

**Legacy:** `*.k.manuel-weiss.ch` wird in der App weiter erkannt, neue Links nutzen `impl`.

## AWS

- **CloudFront** `E305V0ATIXMNNG`: Aliases `impl.manuel-weiss.ch`, `*.impl.manuel-weiss.ch` (ggf. plus legacy `k`)
- **Route53:** `impl` + `*.impl` → CNAME `d2wfiswblfliss.cloudfront.net`
- **Einrichtung / Erweiterung:** `./scripts/setup-kickoff-dns-aws.sh`
- **ACM** (us-east-1): Zertifikat muss `impl.manuel-weiss.ch` und `*.impl.manuel-weiss.ch` abdecken

Nach CloudFront-Deploy (5–15 Min) testen:

```bash
curl -sI "https://shs.impl.manuel-weiss.ch/?s=test"
```

## Pro Kunde

Link in Kick-off Studio → Einstellungen → **Kunden-Link kopieren**.

## Fallback

`https://manuel-weiss.ch/onboarding/kickoff-presenter?session=…` — funktioniert immer.

## Noch kürzer / ohne manuel-weiss.ch

Nur mit **eigener Kunden-Domain** (optional in der App).
