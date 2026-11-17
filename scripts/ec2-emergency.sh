#!/usr/bin/env bash
# OpenClaw + Tempus Excel Mapper nur bei Bedarf starten/stoppen.
# Gestoppt: ~2–4 USD/Monat (nur EBS). Laufend: ~30–40 USD/Monat.
set -euo pipefail

OPENCLAW_ID="${OPENCLAW_INSTANCE_ID:-i-0b2c68015a683fbb8}"
TEMPUS_ID="${TEMPUS_INSTANCE_ID:-i-067f760b297d11e1f}"
REGION="${AWS_REGION:-eu-central-1}"

usage() {
  cat <<'EOF'
Usage: ./scripts/ec2-emergency.sh <status|start|stop|start-openclaw|start-tempus>

  status         Zustand beider Instanzen
  start          Beide starten (Notfall)
  stop           Beide stoppen (Kosten sparen)
  start-openclaw Nur OpenClaw starten
  start-tempus   Nur Excel-Mapper starten (DNS excel-mapper.manuel-weiss.ch ggf. neue IP!)

Hinweis: EC2 ist kein echtes Pay-per-Request. Gestoppt zahlst du nur die Festplatte.
Die öffentliche IP ändert sich nach Stop/Start (Elastic IP wurde freigegeben).
EOF
}

state_of() {
  aws ec2 describe-instances --region "$REGION" --instance-ids "$1" \
    --query 'Reservations[0].Instances[0].[Tags[?Key==`Name`].Value|[0],State.Name,PublicIpAddress]' \
    --output text
}

wait_running() {
  local id="$1"
  echo "Warte bis $id running …"
  aws ec2 wait instance-running --region "$REGION" --instance-ids "$id"
  state_of "$id"
}

cmd="${1:-}"
case "$cmd" in
  status)
    state_of "$OPENCLAW_ID"
    state_of "$TEMPUS_ID"
    ;;
  stop)
    aws ec2 stop-instances --region "$REGION" --instance-ids "$OPENCLAW_ID" "$TEMPUS_ID" --output text
    echo "Gestoppt. Ersparnis ~30 USD/Monat, EBS bleibt (~2–4 USD)."
    ;;
  start)
    aws ec2 start-instances --region "$REGION" --instance-ids "$OPENCLAW_ID" "$TEMPUS_ID" --output text
    wait_running "$OPENCLAW_ID"
    wait_running "$TEMPUS_ID"
    echo "Beide laufen. Tempus-DNS (excel-mapper.manuel-weiss.ch) ggf. auf neue Public IP setzen."
    ;;
  start-openclaw)
    aws ec2 start-instances --region "$REGION" --instance-ids "$OPENCLAW_ID" --output text
    wait_running "$OPENCLAW_ID"
    ;;
  start-tempus)
    aws ec2 start-instances --region "$REGION" --instance-ids "$TEMPUS_ID" --output text
    wait_running "$TEMPUS_ID"
    echo "Neue IP oben – A-Record excel-mapper.manuel-weiss.ch aktualisieren falls nötig."
    ;;
  *)
    usage
    exit 1
    ;;
esac
