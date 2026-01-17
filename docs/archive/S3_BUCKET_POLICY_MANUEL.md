# S3 Bucket Policy manuell erstellen

Da die Bucket Policy nicht über die CLI erstellt werden kann, bitte manuell in der AWS Console:

## Schritte:

1. **Gehe zu AWS Console → S3**
2. **Wähle den Bucket**: `manuel-weiss-hero-videos`
3. **Klicke auf "Permissions" Tab**
4. **Scrolle zu "Bucket policy"**
5. **Klicke auf "Edit"**
6. **Füge diese Policy ein:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::manuel-weiss-hero-videos/*"
    }
  ]
}
```

7. **Klicke auf "Save changes"**

## Nach dem Erstellen:

1. Warte 1-2 Minuten (S3 Propagation)
2. Lade die Startseite neu (Hard Refresh: Cmd+Shift+R)
3. Das Video sollte jetzt angezeigt werden!

## Alternative: Video erneut hochladen

Nach dem nächsten Deploy wird der Code versuchen, Videos mit `ACL: 'public-read'` hochzuladen. Falls das nicht funktioniert (weil ACLs deaktiviert sind), muss die Bucket Policy erstellt werden.

