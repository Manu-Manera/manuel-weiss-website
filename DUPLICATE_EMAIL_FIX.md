# 🔧 Doppelte E-Mails Problem - Behoben

## ❌ Problem

E-Mails wurden **zweimal** weitergeleitet, weil zwei Receipt Rules die Lambda-Funktion ausgelöst haben:

1. **`mail-email-rule`** - Spezifisch für `mail@manuel-weiss.ch`
2. **`ReceiptRuleSetIncomingEmailRule657D93E2`** - Domain-Rule für `manuel-weiss.ch` (erfasst ALLE E-Mails an @manuel-weiss.ch)

Beide Rules hatten S3 + Lambda Actions, daher wurde die Lambda-Funktion **zweimal** für jede E-Mail ausgelöst.

## ✅ Lösung

Die spezifische Rule `mail-email-rule` wurde **deaktiviert**, da die Domain-Rule bereits alle E-Mails an `@manuel-weiss.ch` erfasst, einschließlich `mail@manuel-weiss.ch`.

**Aktive Konfiguration:**
- ✅ **Domain-Rule:** `manuel-weiss.ch` (erfasst alle E-Mails)
- ❌ **mail-email-rule:** Deaktiviert (redundant)

## 📊 Ergebnis

**Vorher:**
- E-Mail kommt an → 2 Rules ausgelöst → Lambda 2x ausgeführt → 2x weitergeleitet ❌

**Nachher:**
- E-Mail kommt an → 1 Rule ausgelöst → Lambda 1x ausgeführt → 1x weitergeleitet ✅

## 🧪 Test

Nach dem Fix:
1. Senden Sie eine Test-E-Mail an `mail@manuel-weiss.ch`
2. Die E-Mail sollte **nur einmal** ankommen ✅
3. Betreff: `[Weitergeleitet] ...`

## 📝 Technische Details

**Deaktivierte Rule:**
- Name: `mail-email-rule`
- Recipients: `mail@manuel-weiss.ch`
- Status: Deaktiviert (aber nicht gelöscht, falls später benötigt)

**Aktive Rule:**
- Name: `ReceiptRuleSetIncomingEmailRule657D93E2-71oEhMtlYDe0`
- Recipients: `manuel-weiss.ch` (Domain-Rule)
- Actions: S3 + Lambda
- Status: Aktiv ✅

## 🔄 Falls Sie die Rule wieder aktivieren möchten

```bash
aws ses update-receipt-rule \
  --rule-set-name manu-email-rules \
  --rule '{
    "Name": "mail-email-rule",
    "Enabled": true,
    "Recipients": ["mail@manuel-weiss.ch"],
    "Actions": [
      {
        "S3Action": {
          "BucketName": "manu-email-storage-038333965110",
          "ObjectKeyPrefix": "emails/"
        }
      },
      {
        "LambdaAction": {
          "FunctionArn": "arn:aws:lambda:eu-central-1:038333965110:function:ManuelWeissEmailSetup-EmailProcessor218EC076-i0Dq2uhJRLy9"
        }
      }
    ]
  }' \
  --region eu-central-1
```

**Aber:** Dies würde wieder zu doppelten E-Mails führen!

