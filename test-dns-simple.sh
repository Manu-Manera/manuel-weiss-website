#!/bin/bash
# Einfacher DNS-Test

echo "🔍 Prüfe Nameserver für manuel-weiss.ch..."
echo ""

# Test 1: Lokaler DNS
echo "1. Lokaler DNS:"
dig NS manuel-weiss.ch +short 2>&1
echo ""

# Test 2: Google DNS
echo "2. Google DNS (8.8.8.8):"
dig NS manuel-weiss.ch @8.8.8.8 +short 2>&1
echo ""

# Test 3: Cloudflare DNS
echo "3. Cloudflare DNS (1.1.1.1):"
dig NS manuel-weiss.ch @1.1.1.1 +short 2>&1
echo ""

echo "✅ Test abgeschlossen"
echo ""
echo "Wenn nichts angezeigt wird:"
echo "→ DNS-Propagierung läuft noch (1-24h normal)"
echo "→ Prüfen Sie später erneut"

