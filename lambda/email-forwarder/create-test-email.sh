#!/bin/bash

# Erstellt eine Test-E-Mail in S3 für Lambda-Testing

BUCKET="manu-email-storage-038333965110"
KEY="emails/test-email-$(date +%s)"
REGION="eu-central-1"

# Erstelle Test-E-Mail mit quoted-printable Content
TEST_EMAIL="From: test@example.com
To: mail@manuel-weiss.ch
Subject: =?UTF-8?Q?Test_E-Mail_mit_Sonderzeichen?=
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: quoted-printable
Date: $(date -R)

Gr=C3=BCezi Herr Weiss

Danke f=C3=BCr Ihr Vertrauen und Ihre Bewerbung auf LinkedIn. Gerne m=C3=B6=
chte ich
Sie im Rahmen eines Gespr=C3=A4ches, via google-Meet, einladen. Bitte sende=
n Sie
mir hierzu zwei-drei Terminvorschl=C3=A4ge f=C3=BCr n=C3=A4chste Woche zu.

Es w=C3=A4re zudem vorteilhaft, wenn Sie mir vorweg Ihre Zeugnisse und Dipl=
ome
als PDF zusenden k=C3=B6nnten.

Ich freue mich von Ihnen zu h=C3=B6ren und auf unser Gespr=C3=A4ch.

Beste Gr=C3=BCsse aus dem Go4HR Recruiting-Hub"

echo "📧 Erstelle Test-E-Mail in S3..."
echo "Bucket: $BUCKET"
echo "Key: $KEY"
echo ""

# Speichere E-Mail in S3
echo "$TEST_EMAIL" | aws s3 cp - "s3://$BUCKET/$KEY" --region "$REGION"

if [ $? -eq 0 ]; then
    echo "✅ Test-E-Mail erstellt: s3://$BUCKET/$KEY"
    echo ""
    echo "📋 Nächste Schritte:"
    echo "1. Lambda-Funktion manuell mit Test-Event aufrufen"
    echo "2. Oder warten auf echte E-Mail an mail@manuel-weiss.ch"
else
    echo "❌ Fehler beim Erstellen der Test-E-Mail"
    exit 1
fi

