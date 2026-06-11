#!/usr/bin/env bash
# Einmalig: kurze Kick-off-URLs (*.impl.manuel-weiss.ch) → gleiche CloudFront-Distribution
set -euo pipefail

ZONE_ID="${ZONE_ID:-Z02760862I1VK88B8J0ED}"
CF_DIST_ID="${CLOUDFRONT_DISTRIBUTION_ID:-E305V0ATIXMNNG}"
CF_TARGET="${CLOUDFRONT_CNAME_TARGET:-d2wfiswblfliss.cloudfront.net}"
REGION_CF_CERT="us-east-1"
KICKOFF_BASE="impl.manuel-weiss.ch"
KICKOFF_LEGACY_BASE="k.manuel-weiss.ch"
# Kombi-Zertifikat (Hauptsite + Kick-off) — nach erstem Setup:
COMBINED_CERT_ARN="${COMBINED_CERT_ARN:-arn:aws:acm:us-east-1:038333965110:certificate/cfade489-5be8-4318-aa18-ec7594ef47c1}"

echo "==> ACM-Zertifikat (${REGION_CF_CERT})"
CERT_ARN="$COMBINED_CERT_ARN"
STATUS=$(aws acm describe-certificate --certificate-arn "$CERT_ARN" --region "$REGION_CF_CERT" \
  --query Certificate.Status --output text 2>/dev/null || echo MISSING)
echo "   Kombi-Zertifikat: $CERT_ARN ($STATUS)"
if [ "$STATUS" != "ISSUED" ]; then
  echo "   Warte auf ISSUED oder COMBINED_CERT_ARN setzen."
  exit 1
fi

echo "==> DNS-Validierung (ACM → Route53)"
aws acm describe-certificate --certificate-arn "$CERT_ARN" --region "$REGION_CF_CERT" \
  --query 'Certificate.DomainValidationOptions' --output json > /tmp/acm-kickoff-validation.json

python3 <<'PY'
import json, subprocess, sys
zone = "Z02760862I1VK88B8J0ED"
with open("/tmp/acm-kickoff-validation.json") as f:
    opts = json.load(f)
changes = []
for o in opts:
    dvo = o.get("ResourceRecord") or {}
    if not dvo.get("Name"):
        continue
    name = dvo["Name"].rstrip(".")
    changes.append({
        "Action": "UPSERT",
        "ResourceRecordSet": {
            "Name": name,
            "Type": dvo["Type"],
            "TTL": 300,
            "ResourceRecords": [{"Value": dvo["Value"]}],
        },
    })
if not changes:
    print("Keine Validierungs-Records (Zertifikat evtl. schon issued).", file=sys.stderr)
    sys.exit(0)
batch = {"Comment": "ACM validation kickoff subdomains", "Changes": changes}
open("/tmp/r53-acm-kickoff.json", "w").write(json.dumps(batch))
subprocess.run([
    "aws", "route53", "change-resource-record-sets",
    "--hosted-zone-id", zone,
    "--change-batch", "file:///tmp/r53-acm-kickoff.json",
], check=True)
print(f"   {len(changes)} Validierungs-Record(s) gesetzt.")
PY

echo "==> Warten auf ACM Issued (max ~10 Min)…"
for i in $(seq 1 40); do
  STATUS=$(aws acm describe-certificate --certificate-arn "$CERT_ARN" --region "$REGION_CF_CERT" \
    --query Certificate.Status --output text)
  echo "   [$i] Status: $STATUS"
  [ "$STATUS" = "ISSUED" ] && break
  sleep 15
done
[ "$STATUS" = "ISSUED" ] || { echo "ACM noch nicht ISSUED — später erneut ausführen."; exit 1; }

echo "==> Route53: impl + *.impl (und legacy k) → CloudFront"
python3 <<PY
import json, subprocess
zone = "${ZONE_ID}"
target = "${CF_TARGET}"
names = [
    "impl.manuel-weiss.ch", "*.impl.manuel-weiss.ch",
    "k.manuel-weiss.ch", "*.k.manuel-weiss.ch",
]
changes = [
    {"Action": "UPSERT", "ResourceRecordSet": {
        "Name": n, "Type": "CNAME", "TTL": 300,
        "ResourceRecords": [{"Value": target}],
    }}
    for n in names
]
batch = {"Comment": "Kickoff short URLs impl + legacy k", "Changes": changes}
open("/tmp/r53-kickoff-cname.json","w").write(json.dumps(batch))
subprocess.run(["aws","route53","change-resource-record-sets","--hosted-zone-id",zone,"--change-batch","file:///tmp/r53-kickoff-cname.json"], check=True)
print("   CNAME impl + k gesetzt.")
PY

echo "==> CloudFront Aliases + Zertifikat"
export CERT_ARN CF_DIST_ID KICKOFF_BASE KICKOFF_LEGACY_BASE
python3 <<'PY'
import json, os, subprocess, sys
dist_id = os.environ["CF_DIST_ID"]
cert_arn = os.environ["CERT_ARN"]
kickoff_base = os.environ["KICKOFF_BASE"]
legacy_base = os.environ.get("KICKOFF_LEGACY_BASE", "k.manuel-weiss.ch")

raw = subprocess.check_output(["aws", "cloudfront", "get-distribution-config", "--id", dist_id])
meta = json.loads(raw)
etag = meta["ETag"]
cfg = meta["DistributionConfig"]

aliases = set(cfg.get("Aliases", {}).get("Items") or [])
aliases.update([
    "manuel-weiss.ch", "www.manuel-weiss.ch",
    kickoff_base, f"*.{kickoff_base}",
    legacy_base, f"*.{legacy_base}",
])
cfg["Aliases"] = {"Quantity": len(aliases), "Items": sorted(aliases)}

cfg["ViewerCertificate"] = {
    "ACMCertificateArn": cert_arn,
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021",
    "Certificate": cert_arn,
    "CertificateSource": "acm",
}
cfg["PriceClass"] = cfg.get("PriceClass") or "PriceClass_100"

out = "/tmp/cf-dist-kickoff.json"
json.dump(cfg, open(out, "w"))
subprocess.run([
    "aws", "cloudfront", "update-distribution",
    "--id", dist_id, "--if-match", etag,
    "--distribution-config", f"file://{out}",
], check=True)
print("   CloudFront Update gestartet (Deploy ~5–15 Min).")
PY

echo "✅ Fertig. Test: https://shs.impl.manuel-weiss.ch/?s=<session-id>"
