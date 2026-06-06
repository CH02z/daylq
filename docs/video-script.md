# daylq · Video-Walkthrough Skript

> **Ziel-Dauer:** ca. 6:00 min (im Korridor 5–7 min)
> **Sprache:** Hochdeutsch
> **Format:** Voice-Over separat aufgenommen + stummes Screen-Recording, anschliessend in Schnittsoftware zusammengeführt
> **Sprechtempo:** ruhig, ~140 Wörter/min (gemütliche Apple-Keynote-Geschwindigkeit)

---

## Vorbereitung vor der Aufnahme

- **Browser:** Chrome im Inkognito (saubere UI, kein Tab-Clutter)
- **Viewport:** Desktop 1280×800 für die Hauptdemo, am Ende ein kurzer Mobile-Switch (440×956)
- **Demo-Account:** `chris.zimmermann@hotmail.ch` ist mit Seed-Daten befüllt (7 Habits · 940 Completions · 13 Tage Streak)
- **Vor der Aufnahme einmal `node scripts/seed-chris.js` laufen lassen**, damit „heute" frische Daten hat
- **Theme:** Dark Mode (für das Show-Reel)
- **Im Voice-Over keine Sprechpausen >2 s lassen** — die schneidest du nachher mit Schweige-Stretch im Editor zu

---

## Strukturübersicht

| # | Abschnitt | Dauer | Wörter ca. |
|---|---|---|---|
| 1 | Intro & Pitch | 0:20 | 50 |
| 2 | Account erstellen | 0:35 | 80 |
| 3 | Empty State + Ersten Habit anlegen | 1:10 | 165 |
| 4 | Dashboard mit Live-Daten | 1:00 | 140 |
| 5 | Check-In (Toggle + Counter) + Notiz | 0:45 | 105 |
| 6 | Habit-Detail, Edit, Delete | 0:50 | 115 |
| 7 | Kategorien verwalten | 0:35 | 80 |
| 8 | Settings & Danger-Zone | 0:30 | 70 |
| 9 | Mobile-View + Haptic-Hinweis | 0:25 | 55 |
| 10 | Outro | 0:10 | 25 |
| | **Total** | **~6:00** | **~885** |

---

## SKRIPT

> **Lesehinweis:**
> - **🎙 VO:** = das sprichst du
> - **🖥 SCREEN:** = was zu diesem Zeitpunkt zu sehen ist / geklickt wird
> - Backslash-Schrägstrich „\“ am Satzende = kurze Atempause beim Sprechen

---

### 1. Intro & Pitch — `0:00 – 0:20`

**🖥 SCREEN:** Landing-Page von daylq, leicht scrollen damit die Hero-Mockup-Karte und der Floating-Badge sichtbar sind.

**🎙 VO:**
> «Das ist *daylq* — ein Habit-Tracker, den ich im Modul Prototyping an der ZHAW entwickelt habe. \
> Die Idee: Kleine Gewohnheiten in unter zehn Sekunden pro Tag tracken — ohne überladene Menüs, ohne Paywall. \
> Ich zeige dir jetzt in fünf Minuten alle Workflows: vom Account anlegen bis zum Mehrfach-Check-In.»

---

### 2. Account erstellen — `0:20 – 0:55`

**🖥 SCREEN:**
1. Klick „Registrieren" oben rechts → Register-Formular
2. Felder ausfüllen (Username `demo_user`, Email `demo@daylq.test`, Password `demo12345678`)
3. Submit klicken → Weiterleitung zum leeren Dashboard

**🎙 VO:**
> «Ein Klick auf *Registrieren* und ich lande in einem cleanen Formular. \
> Benutzername, E-Mail, Passwort — fertig. \
> Im Hintergrund läuft eine JWT-basierte Session in einem HTTP-Only-Cookie, also sicher und sieben Tage gültig. \
> Und schon bin ich auf dem Dashboard. Da ich noch keine Habits habe, sehe ich einen freundlichen Empty-State mit Vorschlägen.»

---

### 3. Empty State + Ersten Habit anlegen — `0:55 – 2:05`

**🖥 SCREEN:**
1. Empty-State zeigen (Mockup-Cards, Sparkle-Emoji, Suggestion-Pills)
2. Klick auf grosse CTA „Ersten Habit erstellen →"
3. Im Formular:
   - Name: `2 Liter Wasser`
   - Kategorie „Gesundheit" klicken
   - Tagesziel: 8× Pill klicken (Counter wechselt sichtbar)
   - Icon-Suche: `droplet`, Wasser-Tropfen-Icon klicken
   - Quick-Reminder „☀ Morgens · 07:00" klicken → Browser-Permission-Pop-up erscheint
   - Permission „Erlauben" klicken
4. „Habit erstellen" Submit → Dashboard mit erstem Tile

**🎙 VO:**
> «Das ist der Empty-State, den ein neuer User zuerst sieht. \
> Drei animierte Vorschau-Karten, vier Vorschlags-Pills — und ein klarer Call-to-Action. \
> Ich klicke und lande im Habit-Erstellen-Flow.
>
> *(kurze Pause beim Klick)*
>
> Oben sehe ich eine Live-Vorschau, die auf jede Eingabe reagiert. \
> Ich gebe dem Habit einen Namen — *Zwei Liter Wasser* — wähle die Kategorie *Gesundheit* und setze ein Tagesziel von *acht* — denn acht Gläser pro Tag will ich tracken. \
> Das war übrigens eine der wichtigsten Erkenntnisse aus meiner Usability-Evaluation: Mehrfach-Abhaken pro Tag muss möglich sein. \
> Jetzt suche ich noch ein passendes Icon — *droplet* — wähle den Wassertropfen, \
> und setze eine Erinnerung auf sieben Uhr morgens. \
> Direkt fragt mich der Browser nach der Berechtigung für Push-Benachrichtigungen — auch das war ein Feedback-Punkt: nicht erst beim Speichern fragen, sondern sofort, wenn der User die Zeit setzt. \
> Habit erstellen — und ich bin zurück auf dem Dashboard.»

---

### 4. Dashboard mit Live-Daten — `2:05 – 3:05`

**🖥 SCREEN:**
1. Ausloggen (rechts oben oder via Settings)
2. Login mit `chris.zimmermann@hotmail.ch` (mit Seed-Daten)
3. Dashboard zeigt vollen Datenbestand
4. Langsam durch die Bereiche zeigen:
   - Greeting + Progress-Ring (animiert auf 86 %)
   - 4 Stat-Tiles (Heute erledigt, Beste Streak, Completions gesamt, Aktive Habits)
   - Achievement-Pills (4 Total-Badges erreicht)
   - Heatmap-Period-Selector → einmal auf 6 M klicken (Heatmaps animieren um)
   - Kategorie-Filter → einmal auf „Gesundheit" klicken, dann wieder „Alle"

**🎙 VO:**
> «Damit du das mit echten Daten siehst, logge ich mich kurz mit meinem Demo-Account ein. \
> Der hat *sieben* Habits über die letzten *neunzig* Tage.
>
> *(Login passiert)*
>
> Oben das Greeting mit meinem Namen und ein animierter Progress-Ring — heute habe ich bereits sechs von sieben Habits erledigt, das sind sechsundachtzig Prozent. \
> Daneben die wichtigsten Zahlen: aktuelle Streak, total neunhundertvierzig Completions, sieben aktive Habits. \
> Darunter Achievement-Badges — alle vier Meilensteine habe ich schon geschafft.
>
> Jetzt das interessante: Ich kann den Zeitraum der Heatmaps live umschalten. \
> Vier Wochen, acht Wochen, vierzehn Wochen, oder sechs Monate. \
> Die Auswahl wird im LocalStorage gespeichert, also bleibt sie nach einem Reload erhalten. \
> Und mit den Kategorie-Chips filtere ich nach Bereich — zum Beispiel nur Gesundheits-Habits, oder zurück zu Alle.»

---

### 5. Check-In + Notiz — `3:05 – 3:50`

**🖥 SCREEN:**
1. Auf ein Single-Goal-Habit-Tile scrollen (z.B. „Meditation")
2. Klick auf grosse CTA „Heute abhaken" → Tile färbt sich, Pulse-Animation
3. Notizfeld erscheint → „guter Morgen, klarer Kopf" eintippen (langsam)
4. Auf ein Multi-Goal-Tile scrollen („Zwei Liter Wasser" mit Counter)
5. Mehrmals auf das + klicken bis 8/8 voll ist (Progress-Bar wächst sichtbar)
6. Tile wechselt in „Heute geschafft"-Vollfarbe

**🎙 VO:**
> «Ein Habit wird abgehakt mit einem einzigen Tap. \
> Sobald ich erledigt habe, taucht ein Notizfeld auf — für eine kurze Reflexion oder den Buchtitel, den ich gelesen habe.
>
> *(Wechsel zum Wasser-Habit)*
>
> Bei Habits mit Tagesziel sieht das Ganze etwas anders aus. \
> Statt eines Toggles bekomme ich einen Counter mit Minus und Plus. \
> Ich klicke mich hoch — eins, zwei, drei, vier, fünf, sechs, sieben, acht — \
> und sobald ich das Tagesziel erreicht habe, wird der Counter voll-farbig und feiert mit einer Puls-Animation. \
> Im Hintergrund speichert die App jeden Klick optimistisch, also ohne wahrnehmbare Verzögerung.»

---

### 6. Habit-Detail, Edit, Delete — `3:50 – 4:40`

**🖥 SCREEN:**
1. Klick auf eine Tile (z.B. „Lesen") → Habit-Detail-Page
2. Hero-Card mit grossem Icon, Kategorie, Stats zeigen
3. Heatmap-Period auf „1 Jahr" oder „Alles" stellen (zeigt komplette Historie)
4. „Bearbeiten" oben rechts klicken
5. Im Edit-Sheet kurz den Namen ändern, Reminder-Zeit auf 20:00, dann „Speichern"
6. Hero-Card zeigt neuen Namen
7. Bis Delete-Zone scrollen, „Löschen" klicken — bei Confirm „Abbrechen"

**🎙 VO:**
> «Wenn ich auf eine Tile tippe, lande ich in der Detail-Ansicht. \
> Hier ist die Heatmap richtig gross und ich kann den Zeitraum bis zu *Alles* erweitern. \
> Streak-Badges zeige ich an, sobald sie verdient sind — Drei Tage, Sieben Tage, Vierzehn, Dreissig, bis zu einem Jahr.
>
> Mit *Bearbeiten* kann ich Name, Kategorie, Icon, Tagesziel und Erinnerungszeit anpassen — alle Felder, die ich beim Erstellen gesetzt habe. \
> Speichern, fertig.
>
> Und ganz unten — bewusst rot abgesetzt — die Lösch-Zone. \
> Ein zweistufiges Confirm verhindert versehentliches Löschen. \
> Genau diese Sicherheitsabfrage wurde von beiden Testpersonen besonders gelobt.»

---

### 7. Kategorien verwalten — `4:40 – 5:15`

**🖥 SCREEN:**
1. Nav zu „Kategorien"
2. Standard-Kategorien zeigen (read-only)
3. Im Create-Block: Name „Finanzen" tippen, eine Farbe wählen (Live-Preview-Dot ändert sich), „Erstellen"
4. Bei „Finanzen" auf Edit-Icon klicken → Inline-Edit aufklappen, Farbe wechseln → Speichern
5. Auf Delete-Icon → Confirm → Abbrechen

**🎙 VO:**
> «Kategorien sind ein eigener Bereich. \
> Sechs Standard-Kategorien sind vorgegeben, eigene kann ich beliebig anlegen — mit Name und Farbe. \
> Die Vorschau ist live: sobald ich eine Farbe wähle, sehe ich den Punkt oben sofort. \
> Eigene Kategorien lassen sich auch nachträglich umbenennen oder umfärben — wenn ich die Farbe ändere, übernimmt die App das auf allen Habits, die diese Kategorie nutzen. \
> Auch löschen ist möglich — natürlich mit Sicherheitsabfrage.»

---

### 8. Settings & Danger-Zone — `5:15 – 5:45`

**🖥 SCREEN:**
1. Nav zu „Profil"
2. Avatar, Stats, Account-Infos zeigen
3. Theme-Switcher → einmal auf „Hell" klicken (gesamte App flipped sichtbar), wieder zurück auf „Dunkel"
4. Bis ganz unten scrollen zur Danger-Zone
5. „Löschen" klicken → Confirm-Block aufklappen, kurz das Input-Feld zeigen, „Abbrechen"

**🎙 VO:**
> «In den Settings sehe ich meinen Account, meine Gesamt-Statistik — und kann das Theme zwischen Hell und Dunkel umschalten. \
> Das Theme wird über einen Cookie gespeichert und initial vor dem ersten Paint geladen, damit es kein Flash-of-Light gibt.
>
> Ganz unten die Danger-Zone: Hier kann ich alle meine Daten löschen — Habits, Check-Ins, eigene Kategorien. \
> Damit das nicht aus Versehen passiert, muss ich das Wort *LÖSCHEN* in Grossbuchstaben eintippen. \
> Erst dann wird der rote Button aktiv.»

---

### 9. Mobile-View + Haptic — `5:45 – 6:10`

**🖥 SCREEN:**
1. DevTools Responsive auf iPhone 16 Pro Max (440×956) wechseln
2. Dashboard mobile zeigen — Bottom-Nav-Pille mit „+ Habit" rechts aussen
3. Einmal auf jedes Bottom-Nav-Item tippen (Dashboard / Kategorien / Profil)
4. Tile-Counter mehrmals tappen (Inc / Dec) — für die Haptic-Demo

**🎙 VO:**
> «Auf dem iPhone — hier ein iPhone 16 Pro Max — bekommt die App einen iOS-typischen Bottom-Bar. \
> Drei Tabs links und ein separater Action-Button für *Plus Habit* ganz rechts, klar als CTA erkennbar. \
> Auf Android-Geräten gibt es zusätzlich haptisches Feedback bei jedem Tap, jedem Counter-Click, jedem Submit — über die Web-Vibration-API. \
> Apple unterstützt das in Safari leider nicht, dort bleibt das visuelle Spring-Feedback.»

---

### 10. Outro — `6:10 – 6:25`

**🖥 SCREEN:** Zurück auf Dashboard im Dark-Mode mit allen Daten, langsamer Scroll-Zoom-Out.

**🎙 VO:**
> «Das war *daylq*. \
> Online erreichbar unter daylq punkt netlify punkt app. \
> Quellcode auf GitHub. \
> Danke fürs Zuschauen.»

---

## Sprech-Tipps

- **Vor jedem Abschnitt einmal kurz Pause** — das gibt dir Schnittpuffer
- **Zahlen ausschreiben**: „acht" statt „8", „sechsundachtzig Prozent" statt „86 %"
- **Eigennamen langsam**: „day-l-q" als „daylq" deutlich sprechen, am besten am Anfang einmal phonetisch klären
- **Atempausen vor Aufzählungen**: „Streak — Tagesziel — Erinnerung"
- **Lächeln beim Sprechen** — auch wenn man dich nicht sieht, klingt es wärmer
- **Mikro nah am Mund**, aber Pop-Filter / Abstand 10–15 cm gegen Plosive (P, B, T)

## Schnitt-Tipps

- **Erst Voice-Over schneiden** (Pausen kürzen, Versprecher rausschneiden), dann Bild dazu sync'n
- Wenn das Voice-Over schneller fertig ist als die Aktionen: **Bild-Spur dehnen** (1.1×–1.3× ist unauffällig) oder kurzen Standbild-Frame einfügen
- Soft-Cut zwischen den 10 Abschnitten (200 ms Fade) wirkt professioneller als Hard-Cut
- Hintergrundmusik optional, aber **maximal −24 dB** unter dem Voice-Over, sonst nervt es
- Im Endformat **MP4 H.264, 1080p, 30 fps** für maximale Kompatibilität

## Wenn du auf Zeit kommen willst

Wenn du nach erstem Take auf 7+ min landest: am ehesten kürzen kann man

1. Abschnitt 4 (Dashboard) → nur Ring + ein Stat-Tile statt alle vier nennen
2. Abschnitt 9 (Mobile) → ohne Vibration-API-Erklärung
3. Abschnitt 1 (Intro) → ein Satz weglassen

Wenn du unter 5 min landest: ein paar Sätze über die Heatmap-Farben oder die PWA-Funktion („Zum Home-Screen hinzufügen") einschieben.
