# 🚀 Schnelle Lösung für Force Push

## GitHub Personal Access Token erstellen:

### Schritt 1: Token erstellen (2 Minuten)

1. **Öffnen Sie:** https://github.com/settings/tokens/new

2. **Füllen Sie aus:**
   - **Note:** "Force Push für Website-Rollback"
   - **Expiration:** 7 days (reicht für heute)
   - **Select scopes:** Aktivieren Sie nur:
     - ✅ **repo** (Full control of private repositories)

3. **Klicken Sie:** "Generate token"

4. **WICHTIG:** Kopieren Sie den Token sofort!
   - Format: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Sie sehen ihn nur EINMAL!

### Schritt 2: Force Push durchführen

Wenn Sie den Token haben, geben Sie mir Bescheid - ich führe dann den Push-Befehl für Sie aus.

Der Befehl wird sein:
```bash
git push https://DER-TOKEN@github.com/Manu-Manera/manuel-weiss-website.git main --force-with-lease
```

---

## Alternative: Über GitHub.com (ohne Token)

1. Gehen Sie zu: https://github.com/Manu-Manera/manuel-weiss-website
2. Klicken Sie auf **Branches** (neben dem Branch-Dropdown)
3. Suchen Sie `rollback-to-working-state` Branch
4. Klicken Sie auf die drei Punkte ⋯
5. Wählen Sie "Set as default branch"
6. Bestätigen Sie
7. Dann können Sie `main` löschen und `rollback-to-working-state` in `main` umbenennen

---

Welche Methode bevorzugen Sie?
- **A) Token erstellen** (dauert 2 Min, dann kann ich alles machen)
- **B) Über GitHub.com** (Sie machen es selbst, dauert 3 Min)

