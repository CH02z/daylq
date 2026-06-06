# Projektdokumentation – daylq

> Ein ruhiger, mobil-optimierter Habit-Tracker für die ZHAW. Schöne Heatmaps, klare Streaks und ein 1-Tap-Check-In, damit aus kleinen Routinen grosse Veränderungen werden.

**Repository:** https://github.com/CH02z/daylq
**Deployment:** https://daylq.netlify.app *(öffentlich zugängliche Live-Version)*
**Autor:** Chris Zimmermann · ZHAW SML · Modul Prototyping FS 2026

---

## Inhaltsverzeichnis

1. [Ausgangslage](#1-ausgangslage)
2. [Lösungsidee](#2-lösungsidee)
3. [Vorgehen & Artefakte](#3-vorgehen--artefakte)
    1. [Understand & Define](#31-understand--define)
    2. [Sketch](#32-sketch)
    3. [Decide](#33-decide)
    4. [Prototype](#34-prototype)
    5. [Validate](#35-validate)
4. [Erweiterungen](#4-erweiterungen)
5. [Projektorganisation](#5-projektorganisation)
6. [KI-Deklaration](#6-ki-deklaration)
7. [Anhang](#7-anhang)

> **Hinweis:** Massgeblich sind die im **Unterricht** und auf **Moodle** kommunizierten Anforderungen.

---

## 1. Ausgangslage

- **Problem:** Viele Menschen nehmen sich vor, neue Gewohnheiten zu etablieren (mehr Wasser trinken, regelmässig lesen, Meditation, Sport), brechen aber bereits nach wenigen Tagen ab. Etablierte Apps wie Strides, Habitica oder Streaks haben mehrere Schwächen: Sie sind entweder **überladen** (zu viele Optionen, Spielmechaniken), **abonnement-basiert** mit harten Paywalls oder **wenig motivierend** in der Darstellung des Fortschritts. Gleichzeitig fehlt eine niederschwellige Lösung, die in **unter 10 Sekunden pro Tag** funktioniert und trotzdem visuell belohnt.

- **Ziele:**
  - Habit-Tracking soll in unter 10 Sekunden pro Tag möglich sein (1-Tap-Check-In)
  - Visueller Fortschritt soll motivieren, nicht beschämen (Heatmaps statt Mahnungen)
  - Kostenlos, ohne Tracking, ohne Werbung
  - Auf allen Geräten verfügbar (Web-basiert, Mobile-First)
  - Trotz minimaler Bedienzeit ein **kompletter** Tracker (Streaks, Notizen, Kategorien, Erinnerungen)

- **Primäre Zielgruppe:** Selbstmotivierte Personen zwischen 18 und 40 Jahren, die mit digitalen Tools vertraut sind und neue Gewohnheiten etablieren wollen, ohne sich in einer komplexen App zu verlieren – typischerweise Studierende und Berufstätige im Wissensbereich.

- **Weitere Stakeholder:** Dozierende der ZHAW SML (Modul Prototyping, FS 2026) als Bewertende der Projektarbeit.

---

## 2. Lösungsidee

- **Kernfunktionalität:**
  1. **Account anlegen** (Username + Email + Passwort, JWT-Session in httpOnly-Cookie)
  2. **Habit erstellen** mit Name, Symbol, Farbe, Kategorie und optionalem Tagesziel + Erinnerungszeit
  3. **Tägliches Check-In** mit 1 Tap (binär) oder Counter (Mehrfach-Goal z.B. 8× Wasser)
  4. **Notiz** pro Check-In für Reflexion
  5. **Heatmap-Visualisierung** (GitHub-Style) für letzten 4 Wochen bis 6 Monate
  6. **Streak-Counter** (aktuelle Erfolgsserie, beste Streak je Habit)
  7. **Achievement-Badges** für Meilensteine (3/7/30/100/365 Tage Streak, 10/50/100/365 Completions)
  8. **Browser-Push-Erinnerungen** zur konfigurierten Tageszeit
  9. **Kategorien-Verwaltung** (Standard + eigene Kategorien mit Farbe)
  10. **Dashboard-Analytics** (Progress-Ring heute, letzte 7 Tage, beste Wochentage, Kategorie-Verteilung, Streak-Ranking)

- **Annahmen:**
  - Nutzer:innen sind bereit, sich einmalig zu registrieren (für Cross-Device-Sync)
  - Browser-Benachrichtigungen sind als Erinnerung ausreichend (kein nativer Push nötig)
  - Visualisierung > Gamification: GitHub-Heatmap motiviert mehr als Punkte/Level
  - Mobile-First ist Pflicht: ≥ 70 % der Nutzung passiert auf dem Smartphone

- **Abgrenzung:** Folgendes ist **nicht** Teil dieses Prototypen:
  - Native iOS- oder Android-App (Web-PWA reicht)
  - Soziale Features (Freunde, Sharing, Wettkampf)
  - KI-gestütztes Habit-Coaching
  - Apple-Health / Google-Fit Integration
  - Wear OS / Apple-Watch Komponenten

---

## 3. Vorgehen & Artefakte

Das Projekt wurde in den fünf vorgegebenen Phasen durchgeführt (Understand/Define → Sketch → Decide → Prototype → Validate). Die wichtigsten Artefakte pro Phase sind unten dokumentiert.

### 3.1 Understand & Define

- **Zielgruppenverständnis:**
  Eine kurze Problemraumanalyse zeigte: Bestehende Habit-Tracker scheitern an einem der drei Pole **Aufwand** (zu viel Konfiguration pro Habit), **Kosten** (Paywall bei Heatmaps/Streaks) oder **Motivation** (trockene Listen statt Visualisierung). Eine kurze qualitative Befragung im Bekanntenkreis (n = 5) bestätigte: Streaks und visuelle Belohnung sind die meistgenannten Wünsche, während Mehrfach-Konfiguration und Login-Hürden Abbruchgründe sind.

- **Proto-Persona „Alex Muster":**
  > 27 Jahre, Studium Wirtschaftsinformatik, nutzt iPhone + MacBook, hat 3 mal versucht Habit-Tracker zu etablieren (Apple Health, Strides, Notion-Template) – jedes Mal nach 2–3 Wochen abgebrochen. Wünscht sich „weniger Klicks, mehr Belohnung".

- **Wesentliche Erkenntnisse:**
  - Einstiegs-Hürde minimieren: keine Onboarding-Tour, kein Tagesplan-Konzept, sofort Habit anlegen
  - 1-Tap-Check-In ist nicht-verhandelbar
  - Streaks und Heatmap sind Pflichtfeatures
  - Mobile-First, aber Desktop muss gleichwertig nutzbar bleiben (Zielgruppe arbeitet im Browser am Laptop)
  - Cross-Device-Sync verlangt Account – Trade-off, aber für die Zielgruppe akzeptabel

### 3.2 Sketch

- **Variantenüberblick:** Drei Lösungsansätze wurden skizziert:

  | Variante | Kerngedanke | Vorteil | Nachteil |
  |---|---|---|---|
  | **A – Liste mit Checkboxen** | Pro Tag eine Liste, abhaken, fertig | Sehr einfach | Keine Visualisierung, keine Streaks-Belohnung |
  | **B – Karten-Grid mit Heatmap** | Jeder Habit ist eine Kachel mit Mini-Heatmap, Check-In direkt auf der Kachel | Visuelle Belohnung sofort sichtbar, motiviert | Komplexer im Layout |
  | **C – Kalender-View** | Monats-Kalender, jeder Tag zeigt erledigte Habits | Sehr datenreich | Mobile-unfreundlich, hoher Klickaufwand pro Check-In |

- **Skizzen:** Hand-Skizzen aller drei Varianten siehe `docs/sketches/` *(in der Repo abgelegt)*. Variante B wurde zusätzlich in zwei Untervarianten skizziert: B1 mit grosser Heatmap pro Habit (Detail-Seite) und B2 mit Mini-Heatmap direkt auf der Dashboard-Kachel.

### 3.3 Decide

- **Gewählte Variante & Begründung:** **Variante B (Karten-Grid mit Heatmap)** wurde ausgewählt, weil:
  - **Visualisierung der Belohnung** sofort und ohne Navigation sichtbar ist
  - **1-Tap-Check-In** direkt auf der Kachel umsetzbar ist
  - **Skalierbarkeit:** funktioniert für 1 wie für 20 Habits, mit Kategorie-Filter
  - **Mobile-First-tauglich:** Karten-Grid → 1 Spalte mobile, 2 Spalten tablet, 3 Spalten desktop
  - Bewährtes Muster (GitHub-Heatmap) reduziert Lernaufwand

- **End-to-End-Ablauf (User Journey für „Alex Muster, erste Woche"):**

  1. **Tag 1, Morgens:** Alex landet auf der Landing-Page → klickt „Kostenlos starten" → Register-Formular → in unter 30 s ist der Account angelegt, Dashboard wird angezeigt (Empty-State mit Mockup-Cards und Vorschlägen)
  2. **Tag 1, Mittags:** Alex tippt auf einen Vorschlags-Pill „Lesen" → Habit-New-Formular mit Vorschau-Tile → wählt Kategorie „Lernen", Icon Buch, Tagesziel = 1, Erinnerung 21:00 → Habit erstellt
  3. **Tag 1, Abends:** Erinnerungs-Push erscheint → Alex öffnet App, tippt auf grüne CTA-Pille „Heute abhaken" → Notiz „Atomic Habits, Kapitel 4" → fertig
  4. **Tag 4, Tile zeigt 🔥 4 Tage Streak:** positiver Reinforcement-Loop schliesst sich
  5. **Tag 7, Detail-Page:** Alex tippt auf die Tile → Detail mit grosser Heatmap, Stats, Badges → erstes Badge „3 Tage Streak" verdient

- **Mockup:**
  - **Figma:** *(URL zu finalem Mockup als Referenz, siehe `docs/mockup/`)*
  - Mockup-Screenshots der wichtigsten Screens (Landing, Auth, Dashboard, Habit-Detail, Habit-New, Categories, Settings) befinden sich in `docs/screenshots/mockup-*.png`. Das Mockup diente als visuelle Referenz für die finale Umsetzung; die Detail-Ausgestaltung (z.B. Glasmorphismus, Spring-Animationen) wurde in der Implementation verfeinert.

### 3.4 Prototype

#### 3.4.1 Entwurf (Design)

- **Informationsarchitektur:**

  ```
  /                          Landing (öffentlich, marketing)
  /auth/login                Login
  /auth/register             Registrierung
  /auth/logout               Logout (GET-Action)
  ───────────────────────────────────────────────────
  /dashboard                 Dashboard (Übersicht aller Habits, Heatmaps, Stats)
  /habits/new                Habit erstellen
  /habits/[id]               Habit-Detail (Heatmap, Stats, Edit, Delete)
  /categories                Kategorien-Verwaltung (Standard + eigene)
  /settings                  Profil, Theme, Erinnerungen, Danger-Zone
  ───────────────────────────────────────────────────
  /api/checkin               POST – Check-In (toggle / inc / dec)
  /api/checkin/note          PATCH – Notiz für heutigen Check-In
  ```

  Eingeloggter Bereich ist durch Bottom-Nav (Mobile) und Top-Nav-Pills (Desktop) navigierbar. Die Bottom-Nav besteht aus 3 Tabs (Dashboard, Kategorien, Profil) plus einem visuell distinkten **Action-Button „+ Habit"** rechts aussen.

- **User Interface Design – wichtige Screens:**

  - **Landing-Page:** Hero mit Gradient-Headline „Kleine Habits. Grosse Veränderung." + animierter Floating-Card-Mockup (3D-tilt), 6 Feature-Cards, CTA-Strip mit voll-Gradient. Datei: `src/routes/+page.svelte`
  - **Auth (Login/Register):** Eine zentrierte Glas-Karte in farbiger Aura, 52 px hohe Gradient-Submit-Buttons, klare Fehlermeldungen mit Haptic-Error. Dateien: `src/routes/auth/login/+page.svelte`, `src/routes/auth/register/+page.svelte`
  - **Dashboard:** Hero-Greeting mit Username, animierter SVG-Progress-Ring (Gradient-Stroke), 4 Stat-Tiles, Achievement-Pills, Heatmap-Period-Selector, Kategorie-Filter, Habit-Grid, 4 Analytics-Cards. Datei: `src/routes/dashboard/+page.svelte`
  - **HabitTile (Komponente):** Glas-Karte mit Color-Glow, 14-Wochen-Heatmap mit Wochentag- und Monats-Labels, Toggle- oder Counter-CTA (je nach Tagesziel), optionales Notiz-Feld nach Erfolg. Datei: `src/lib/components/HabitTile.svelte`
  - **Habit-Detail:** Hero-Card mit grosser Icon-Vorschau, 3 Stat-Boxen, Heatmap mit konfigurierbarer Periode (4W bis Alles), Edit-Sheet inline, Delete-Zone in rot. Datei: `src/routes/habits/[id]/+page.svelte`
  - **Habit-New:** Live-Preview-Karte oben (reagiert auf jede Auswahl), Kategorie-Chips, Tagesziel-Counter mit Quick-Pills, Icon-Suche, Reminder-Quick-Pills mit sofortiger Browser-Permission-Anfrage. Datei: `src/routes/habits/new/+page.svelte`
  - **Categories:** Live-Color-Preview im Create-Formular, Inline-Edit pro Kategorie, 2-Step-Delete-Confirm. Datei: `src/routes/categories/+page.svelte`
  - **Settings:** Avatar mit Gradient-Initialen, Statistiken, Theme-Switcher (Light/Dark), Permission-Status, Danger-Zone „Alle Daten löschen" mit `LÖSCHEN`-Confirm. Datei: `src/routes/settings/+page.svelte`

  Screenshots der finalen App sind unter `docs/screenshots/app-*.png` abgelegt und im Video-Walkthrough vollständig zu sehen.

- **Designentscheidungen (zentrale Punkte):**

  | # | Entscheidung | Begründung |
  |---|---|---|
  | D1 | **Glasmorphismus + Mesh-Gradient-Hintergrund** | Hebt die App visuell von Standard-Bootstrap-Designs ab, schafft Apple-/Revolut-ähnlichen Premium-Eindruck. Aus Evaluation abgeleitet (V8). |
  | D2 | **Bottom-Nav-Pill (Mobile) + Top-Pill (Desktop)** | iOS-/Revolut-Standard, ergonomisch für Daumen-Reichweite. FAB rechts aussen statt mittig, da klarere Action-Trennung. |
  | D3 | **Heatmap statt Liste / Punkte** | Sofort visuelle Belohnung, bewährtes Muster (GitHub), motiviert ohne Worte. |
  | D4 | **Akzentfarbe pro Habit (statt nur pro Kategorie)** | Erlaubt visuelle Differenzierung der Habits, Heatmap-Cells erhalten Habit-Farbe. Aus Evaluation hervorgeganges Issue (V6) durch Kategorie-Filter teilweise entschärft. |
  | D5 | **Multi-Goal-Counter statt nur Toggle** | Aus Evaluation V1: Habits wie „8 Gläser Wasser" oder „3 Sätze Sport" funktionieren mit Toggle nicht. Counter mit +/- ist robuster. |
  | D6 | **Live-Preview im Habit-New-Form** | Reduziert kognitive Last (kein „was wird das eigentlich aussehen?"), erhöht Engagement. |
  | D7 | **Spring-Animationen + Haptic-Feedback** | Premium-Feel; auf Android via Vibration-API spürbar, auf iOS visuell durch Scale-Animationen. |

#### 3.4.2 Umsetzung (Technik)

- **Technologie-Stack:**

  | Komponente | Tech |
  |---|---|
  | Frontend-Framework | **SvelteKit 5** (Runes-Modus) |
  | Sprache | JavaScript (ESM) |
  | Styling | Custom CSS mit Design-Tokens (CSS Variables), Bootstrap 5.3.3 minimal (nur Grid + Reset), Bootstrap-Icons via CDN, Inter Variable Font (rsms.me) |
  | Backend | SvelteKit Server-Routes (Form-Actions + JSON-APIs) |
  | Datenbank | **MongoDB** (Atlas Cloud, native Driver via `mongodb`-Package) |
  | Auth | JWT in httpOnly-Cookie via `jsonwebtoken`, Passwort-Hashing via `bcryptjs` |
  | Deployment | **Netlify** (Adapter `@sveltejs/adapter-netlify`) |
  | Mobile | PWA-Meta-Tags, Web-Vibration-API, Safe-Area-Insets |

- **Tooling:**

  | Tool | Zweck |
  |---|---|
  | **VS Code** | IDE |
  | **Claude Code (Sonnet 4.5)** | KI-Assistenz für Code, Design-Iterationen, README *(siehe Kap. 6 KI-Deklaration)* |
  | **Git + GitHub** | Versionskontrolle |
  | **MongoDB Compass** | DB-Inspektion lokal |
  | **Chrome DevTools** | Responsive-Testing, Lighthouse |
  | **Netlify CLI** | Deployment-Verifikation |

- **Struktur & Komponenten:**

  ```
  src/
  ├── app.html                           # PWA-Meta, Design-Tokens, Theme-Init
  ├── hooks.server.js                    # JWT-Verifikation pro Request
  ├── lib/
  │   ├── assets/favicon.svg
  │   ├── badges.js                      # Streak/Total-Badge-Definitionen
  │   ├── categories.js                  # Standard-Kategorien, Icon-Gruppen, Preset-Farben
  │   ├── checkinUtils.js                # Count-Berechnung (legacy-tauglich), Streak-Logik
  │   ├── dateUtils.js                   # Timezone-sichere Datumshelfer
  │   ├── haptic.js                      # Vibration-API-Wrapper (tap, success, warn, error)
  │   ├── components/
  │   │   └── HabitTile.svelte           # Heatmap-Karte mit Counter/Toggle
  │   └── server/
  │       ├── db.js                      # Singleton MongoClient + Indizes
  │       └── models/                    # Collection-Wrapper
  │           ├── Category.js
  │           ├── Checkin.js
  │           ├── Habit.js
  │           └── User.js
  └── routes/
      ├── +layout.svelte                 # Glas-Navbar, Bottom-Nav (Mobile)
      ├── +layout.server.js              # User-Daten an Layout liefern
      ├── +page.svelte                   # Landing
      ├── auth/
      │   ├── login/
      │   ├── register/
      │   └── logout/
      ├── dashboard/                     # Hauptansicht
      ├── habits/
      │   ├── new/                       # Habit erstellen
      │   └── [id]/                      # Habit-Detail
      ├── categories/                    # Kategorien-Verwaltung
      ├── settings/                      # Profil + Danger-Zone
      └── api/
          └── checkin/
              ├── +server.js             # POST – Toggle/Inc/Dec
              └── note/+server.js        # PATCH – Notiz
  scripts/
  └── seed-chris.js                      # Test-Daten-Generator (90 Tage)
  static/
  ├── favicon.svg
  ├── manifest.json                      # PWA-Manifest
  └── robots.txt
  ```

  **State-Management:** Keine externen Stores nötig – Svelte 5 Runes (`$state`, `$derived`, `$effect`) decken den Bedarf ab. Server-Daten kommen über `load()`-Funktionen, Optimistic-UI bei Check-Ins direkt im Komponenten-State.

- **Daten & Schnittstellen:**

  MongoDB-Collections (Atlas):

  | Collection | Felder | Indizes |
  |---|---|---|
  | `users` | `_id`, `username`, `email`, `passwordHash`, `createdAt` | unique `email`, unique `username` |
  | `habits` | `_id`, `userId`, `name`, `category`, `icon`, `color`, `dailyGoal`, `reminderTime`, `active`, `createdAt` | `userId` |
  | `checkins` | `_id`, `habitId`, `userId`, `date` (ISO YYYY-MM-DD), `count`, `note`, `completedAt` | `userId+date`, **unique** `habitId+userId+date` |
  | `categories` | `_id`, `userId`, `label`, `color`, `createdAt` | `userId` |

  **Authentifizierung:** Beim Login signiert der Server ein JWT mit User-Payload, setzt es als httpOnly-Cookie (`sameSite: lax`, `secure: !dev`, 7 Tage). Bei jedem Request prüft `hooks.server.js` das Cookie und befüllt `locals.user`. Geschützte Routen redirecten ohne `locals.user` zu `/auth/login`.

  **Check-In-API (`POST /api/checkin`):** Body `{ habitId, action: 'toggle' | 'inc' | 'dec' }`. Server liest aktuellen Count aus Datenbank, berechnet neuen Count (kappt auf `[0, dailyGoal]`), upserted Checkin-Dokument oder löscht es wenn Count auf 0 fällt. Response enthält neuen Count + Goal + Done-Flag.

  **Backwards-Compatibility:** Pre-Refactor Checkin-Docs hatten kein `count`-Feld (impliziert Goal=1, daher count=goal). `checkinUtils.checkinCount()` behandelt fehlendes Feld als „voll erledigt", sodass alte Streaks beim Goal-Wechsel nicht brechen.

- **Deployment:**
  - **Live-URL:** https://daylq.netlify.app
  - **Adapter:** `@sveltejs/adapter-netlify` (Serverless-Functions für SvelteKit-Routes)
  - **DB:** MongoDB Atlas Free-Tier (M0-Cluster)
  - **Environment-Variables** (via Netlify-UI gesetzt): `DB_URI`, `JWT_SECRET`

- **Besondere Entscheidungen / Trade-offs:**

  | Punkt | Entscheidung | Trade-off |
  |---|---|---|
  | Bootstrap behalten | Reset + Grid nutzen, alles andere aggressiv überschreiben | Schnellere Iteration, kein Custom-Grid-System – akzeptiert dass +30 kB Bootstrap-CSS reisen |
  | Keine Migration für `dailyGoal` | Default `1` zur Laufzeit (`habit.dailyGoal \|\| 1`) | Keine DB-Migration, kein Risiko bei Bestandsdaten – minimal komplexere Laufzeit-Logik |
  | Notizen nur sichtbar wenn `count >= goal` | UI versteckt Notiz-Feld bei Teilerfolg | Konsistent, aber Edge-Case: Notiz bleibt nach Inkrement-Reduktion in DB |
  | Browser-Notifications statt nativem Push | Nur `Notification`-API + `setTimeout` | Funktioniert ohne Service-Worker, dafür nur wenn Tab offen ist – akzeptabel für PWA-Add-to-Home-Screen-Nutzung |
  | Haptik via Vibration-API | `navigator.vibrate()` mit no-op auf iOS | Android-User profitieren, iOS-User haben visuelles Feedback (Scale + Spring) |

### 3.5 Validate

- **URL der getesteten Version:** https://daylq.netlify.app *(zur Vergleichbarkeit wurde der getestete Stand am 20.05.2026 als Git-Tag `usability-eval-2026-05-20` markiert; Screenshots in `docs/screenshots/eval-*.png`)*

- **Ziele der Prüfung:**

  Folgende Fragen sollten beantwortet werden:

  - Ist die **Erstregistrierung** und das **Anlegen eines ersten Habits** ohne Hilfe in unter 3 Minuten möglich?
  - Werden die **zentralen Interaktionen** (Abhaken, Notiz hinzufügen, Fortschritt einsehen) intuitiv erkannt?
  - Sind **Streak**, **Heatmap** und **Achievements** verständlich und wirken motivierend?
  - Werden **administrative Funktionen** (Habit bearbeiten/löschen, Kategorien verwalten, Erinnerungen) gefunden, ohne dass Hinweise nötig sind?
  - Wie wird das **Gesamt-Design** wahrgenommen – passt es zur Zielgruppe?

- **Vorgehen:**
  - **Methode:** Moderierter Usability-Test mit **Think-Aloud-Methode**
  - **Setting:** **On-Site** an der ZHAW Winterthur (Lab)
  - **Datum:** 20.05.2026
  - **Dauer pro Test:** ca. 10 Minuten Aufgaben + 5 Minuten Abschlussgespräch
  - **Aufzeichnung:** Beobachtungsbogen pro Testperson (siehe Anhang)
  - **Testleitung:** durch den Autor selbst, eine Testperson zur Zeit

- **Stichprobe:**

  | # | Name | Profil | Gerät / Browser |
  |---|---|---|---|
  | 01 | Erik Grütter | Mitstudent ZHAW, App-affin, kein Vorwissen zur App | iPhone 14 (Safari) |
  | 02 | Ricardo Hengartner | Mitstudent ZHAW, gelegentlicher Habit-Tracker-Nutzer | MacBook Pro 14" (Chrome) |

  **Anzahl Testpersonen:** 2 (entspricht den Vorgaben der Übung).

- **Aufgaben / Szenarien:**

  **Ausgangslage (allen Testpersonen vorgelesen):**

  > Sie heissen Alex Muster und möchten Ihre täglichen Gewohnheiten besser im Blick behalten. Jemand hat Ihnen die App daylq empfohlen. Sie öffnen die App zum ersten Mal auf Ihrem Gerät.

  | # | Aufgabe |
  |---|---|
  | **1** | Sie möchten die App nutzen und brauchen dafür ein persönliches Konto. Legen Sie ein Konto mit dem Benutzernamen *alexmuster* und der E-Mail-Adresse *alex@beispiel.ch* an. Wählen Sie ein Passwort Ihrer Wahl. |
  | **2** | Sie haben sich vorgenommen, jeden Morgen 20 Minuten zu lesen. Tragen Sie diese Gewohnheit in der App ein, sodass Sie sie künftig täglich verfolgen können. Wählen Sie dabei ein passendes Symbol und ordnen Sie die Gewohnheit einer sinnvollen Kategorie zu. |
  | **3** | Es ist Abend und Sie haben heute tatsächlich gelesen. Vermerken Sie in der App, dass Sie Ihre Lesegewohnheit heute erfüllt haben. Halten Sie ausserdem fest, dass Sie heute das Buch «Atomic Habits» gelesen haben. |
  | **4** | Sie sind neugierig, wie konsequent Sie Ihre Lesegewohnheit in letzter Zeit verfolgt haben. Verschaffen Sie sich einen Überblick über Ihren bisherigen Fortschritt und finden Sie heraus, wie lang Ihre aktuelle Erfolgsserie ist. |
  | **5** | Sie haben gemerkt, dass Sie lieber abends als morgens lesen. Ändern Sie den Namen Ihrer Gewohnheit auf «Abendlektüre» und legen Sie fest, dass Sie täglich um 21:00 Uhr eine Erinnerung erhalten möchten. |
  | **6** | Sie wollen eine neue Gewohnheit für Ihre Finanzen anlegen, finden aber keine passende Kategorie. Erstellen Sie eine eigene Kategorie mit dem Namen «Finanzen» und einer Farbe Ihrer Wahl. |
  | **7** | Sie haben entschieden, dass Sie die Lesegewohnheit nicht mehr in der App tracken möchten. Entfernen Sie diese Gewohnheit dauerhaft aus der App. |

- **Kennzahlen & Beobachtungen:**

  **Erfolgsquote & Zeitbedarf:**

  | Aufgabe | Erik (TP 01) | Ricardo (TP 02) | Erfolg gesamt |
  |---|---|---|---|
  | 1 – Konto erstellen | ✅ 1:12 | ✅ 0:58 | 2/2 |
  | 2 – Habit anlegen | ✅ 1:48 | ✅ 1:32 | 2/2 |
  | 3 – Abhaken + Notiz | ✅ 0:55 | ✅ 0:47 | 2/2 |
  | 4 – Fortschritt einsehen | ✅ 0:32 | ✅ 0:38 | 2/2 |
  | 5 – Habit anpassen | ✅ 1:25 | ✅ 1:50 | 2/2 |
  | 6 – Eigene Kategorie | ✅ 1:38 | ✅ 1:20 | 2/2 |
  | 7 – Habit entfernen | ✅ 0:41 | ✅ 0:35 | 2/2 |

  **Erfolgsquote: 100 % (14/14 Aufgaben ohne Hilfe abgeschlossen)**
  **Ø Aufgabenzeit: 1:09 min**
  **Gesamtnote durch TPs: 3 (Befriedigend) – beide**

  **Issue Map** *(Severity-Skala nach Nielsen Norman Group: 0 = kein Problem, 1 = kosmetisch, 2 = klein, 3 = gross, 4 = Katastrophe)*

  | # | Arbeitsschritt | Issue | TP 01 (Erik) | TP 02 (Ricardo) | Severity |
  |---|---|---|---|---|---|
  | I1 | **Auth / Start** | Login-/Register-Seite zu hell, Kontrastbruch zum Dark-UI | «Die Farben sind hier viel zu hell – passt gar nicht zum Rest.» | «Hier wirkt alles ein bisschen wie geblendet – sehr hell.» | **2** |
  | I2 | **Abhaken** | Habit kann nur einmal pro Tag abgehakt werden | «Warum kann ich das nur einmal pro Tag machen?» | «Bei Wasser-Trinken oder Sport-Sets wäre Mehrfach-Abhaken pro Tag echt wichtig.» | **3** |
  | I3 | **Habit erstellen** | Erinnerungs-Konfiguration nicht beim Erstellen, sondern erst beim Bearbeiten | «Eigentlich würde ich erwarten, dass mich die App jetzt direkt fragt, wann ich erinnert werden will.» | «Warum fragt mich der Browser jetzt erst nach Benachrichtigungen?» | **3** |
  | I4 | **Dashboard** | Keine Filter-/Sortiermöglichkeit nach Kategorie | in Anmerkungen erwähnt | «Auf der Übersicht würde ich gern z.B. nur Sport-Habits sehen können.» | **3** |
  | I5 | **Kategorien** | Eigene Kategorien können nicht umbenannt/bearbeitet werden (nur löschen) | «Ich kann sie löschen, aber nicht umbenennen? Wirkt unfertig.» | «Wenn ich eine eigene Kategorie habe, will ich die auch nachträglich anpassen können – Name UND Farbe.» | **2** |
  | I6 | **Dashboard** | Vielzahl an Akzentfarben (eine pro Habit) wirkt unruhig | in Anmerkungen erwähnt | «Wenn ich später 10 Habits habe, wird das hier ein Farbtopf.» | **2** |
  | I7 | **Abhaken** | Notizfeld erscheint erst nach dem Abhaken – wenig sichtbar | «Ah, das Notizfeld kommt erst danach – nicht ganz offensichtlich.» | – (positiv erwähnt) | **1** |
  | I8 | **Allgemein** | Design wirkt zu Bootstrap-nah, wenig eigenständig | in Anmerkungen erwähnt | in Anmerkungen erwähnt | **1** |

  **Positive Findings (Feedback-Grid „gut funktioniert"):**

  | Aspekt | TP 01 | TP 02 |
  |---|---|---|
  | Heatmap-Visualisierung wirkt motivierend | ✅ | ✅ |
  | Sicherheitsabfrage beim Löschen wird explizit gelobt | ✅ | ✅ |
  | Streak-Anzeige (🔥) sofort verständlich | ✅ | ✅ |
  | Symbol- und Kategorieauswahl beim Habit-Erstellen klar | ✅ | – |
  | Notizfunktion beim Abhaken positiv aufgenommen | – | ✅ |
  | Habit-Erstellungsflow klar strukturiert | – | ✅ |

- **Zusammenfassung der Resultate:**

  Beide Testpersonen konnten **alle 7 Kernaufgaben ohne Hilfe** lösen, die durchschnittliche Aufgabenzeit lag bei 1:09 min. Streak, Heatmap und die Sicherheitsabfrage beim Löschen wurden ausdrücklich positiv hervorgehoben. **Drei Issues mit Severity 3** wurden identifiziert: fehlendes Mehrfach-Abhaken pro Tag, zu späte Reminder-Konfiguration und fehlender Kategorie-Filter auf dem Dashboard. Das Konzept als Ganzes ist tragfähig – die abgeleiteten Anpassungen sind Detailverbesserungen, kein grundlegender Konzeptwechsel.

- **Abgeleitete Verbesserungen** *(priorisiert nach Severity × Häufigkeit; konkret im Prototyp umgesetzte Verbesserungen sind in Kap. 4 dokumentiert)*

  | # | Verbesserung | Priorität | Begründung | Umgesetzt? |
  |---|---|---|---|---|
  | V1 | Mehrfach-Abhaken pro Tag (Tagesziel + Counter) | **Hoch** | Severity 3, beide TPs; ganze Habit-Klassen (Wasser, Sport-Sets) sonst nicht abbildbar | ✅ Kap. 4.1 |
  | V2 | Erinnerungszeit direkt im Habit-Erstellen-Flow inkl. Browser-Permission | **Hoch** | Severity 3, beide TPs; aktueller Flow verlangt 2. Schritt | ✅ Kap. 4.2 |
  | V3 | Kategorie-Filter auf dem Dashboard | **Hoch** | Severity 3; skaliert nicht ohne Filterung bei vielen Habits | ✅ Kap. 4.3 |
  | V4 | Eigene Kategorien bearbeitbar (Name + Farbe) | **Mittel** | Severity 2, beide TPs; aktuell nur Löschen möglich | ✅ Kap. 4.4 |
  | V5 | Auth-Seiten farblich an Dark-UI angleichen | **Mittel** | Severity 2, beide TPs; Kontrastbruch wirkt unprofessionell | ✅ Kap. 4.5 |
  | V6 | Dashboard-Farbgebung reduzieren / per Kategorie filterbar | **Mittel** | Severity 2; visuelle Unruhe bei mehr Habits | ✅ via V3 (Filter) |
  | V7 | Notizfeld stärker hervorheben | **Niedrig** | Severity 1; nur eine TP, leicht entdeckbar | offen |
  | V8 | Design eigenständiger (weg vom Bootstrap-Standard) | **Niedrig** | Severity 1; subjektiv, kein Workflow-Blocker | ✅ Kap. 4.6 (Komplettes Redesign) |

---

## 4. Erweiterungen

> Jede Erweiterung folgt dem Schema **Beschreibung & Nutzen** · **Wo umgesetzt** · **Referenz** · **Aus Evaluation abgeleitet?**

### 4.1 Mehrfach-Check-In pro Tag (Tagesziel)

- **Beschreibung & Nutzen:** Habits können ein **Tagesziel** zwischen 1 und 20 Wiederholungen haben (z.B. „8 Gläser Wasser"). Statt eines binären Toggles erscheint auf der HabitTile dann ein Counter mit −/+ Buttons, Progress-Bar und Display „n / goal". Streak und Heatmap zählen nur Tage, an denen `count >= goal` erreicht wurde.
- **Wo umgesetzt:**
  - **Datenmodell:** Feld `dailyGoal` im `habits`-Schema, Feld `count` im `checkins`-Schema (`scripts/seed-chris.js` zeigt Schema-Anwendung)
  - **Backend:** `src/routes/api/checkin/+server.js` – Action-basierte API (`toggle` / `inc` / `dec`), kappt auf `[0, goal]`, löscht Doc bei Count 0
  - **Frontend:** `src/lib/components/HabitTile.svelte` – Toggle bei Goal 1, Counter-UI bei Goal > 1; `src/routes/habits/new/+page.svelte` und `src/routes/habits/[id]/+page.svelte` – Goal-Picker mit Quick-Pills (1×/2×/3×/5×/8×/10×) und −/+ Steppern
  - **Helper:** `src/lib/checkinUtils.js` – Backwards-Compat-Layer für Legacy-Docs ohne `count`-Feld
- **Referenz:** Screenshots `docs/screenshots/multi-checkin-*.png`; Issue Map I2
- **Aus Evaluation abgeleitet?:** **Ja**, V1 (Severity 3, beide TPs)

### 4.2 Reminder beim Erstellen + frühe Browser-Permission

- **Beschreibung & Nutzen:** Die Erinnerungszeit ist nun direkt im Habit-Erstellen-Formular sichtbar mit **Quick-Pills** (☀ Morgens · 🌤 Mittag · 🌆 Abend · 🌙 Spät). Sobald der User eine Zeit setzt, wird **sofort** die Browser-Notification-Permission angefragt – nicht erst beim Speichern. Inline-Status zeigt granted/denied/default.
- **Wo umgesetzt:**
  - **Frontend (Create):** `src/routes/habits/new/+page.svelte` – Quick-Time-Pills + `maybeRequestPermission()`
  - **Frontend (Edit):** `src/routes/habits/[id]/+page.svelte` – identische Quick-Pills im Edit-Sheet
  - **Reminder-Logik:** `src/routes/dashboard/+page.svelte` – `scheduleReminders()` mit Cleanup beim Component-Unmount (verhindert Memory-Leak bei Navigation)
- **Referenz:** Screenshots `docs/screenshots/reminder-*.png`; Issue Map I3
- **Aus Evaluation abgeleitet?:** **Ja**, V2 (Severity 3, beide TPs)

### 4.3 Kategorie-Filter auf dem Dashboard

- **Beschreibung & Nutzen:** Im Dashboard erscheint ab 2 belegten Kategorien eine **horizontale Chip-Reihe** mit „Alle (n)" + jeder Kategorie samt Anzahl. Auswahl filtert die Habit-Grid sofort, leere Filter-Ergebnisse zeigen einen freundlichen Empty-State mit „Alle anzeigen"-Button.
- **Wo umgesetzt:**
  - **Frontend:** `src/routes/dashboard/+page.svelte` – `selectedFilter`-State, `filteredHabits`-derived, `pickFilter()`-Funktion mit Haptic-Tap
  - **CSS:** Snap-Scroll für mobile (`scroll-snap-type: x proximity`)
- **Referenz:** Screenshots `docs/screenshots/filter-*.png`; Issue Map I4
- **Aus Evaluation abgeleitet?:** **Ja**, V3 (Severity 3, Ricardo)

### 4.4 Kategorien bearbeitbar (Name + Farbe)

- **Beschreibung & Nutzen:** Eigene Kategorien können jetzt **Inline editiert** werden (Name + Farbe). Farbänderung **propagiert** auf alle Habits dieser Kategorie, die die alte Farbe noch hatten (keine Custom-Farbe gewählt).
- **Wo umgesetzt:**
  - **Backend:** `src/routes/categories/+page.server.js` – Action `?/edit` mit Ownership-Check und Farb-Propagation per `updateMany`
  - **Frontend:** `src/routes/categories/+page.svelte` – Inline-Edit-Form mit Live-Preview-Dot, Cancel/Save mit Haptic
- **Referenz:** Screenshots `docs/screenshots/categories-edit-*.png`; Issue Map I5
- **Aus Evaluation abgeleitet?:** **Ja**, V4 (Severity 2, beide TPs)

### 4.5 Auth-Seiten und Komplett-Redesign (Apple/Revolut-Stil)

- **Beschreibung & Nutzen:** Die Auth-Seiten waren ursprünglich hell auf hell und brachen visuell aus der dunklen App aus. Im Rahmen eines **vollständigen Design-Refresh** wurden Auth-Seiten **und** die gesamte App auf Glasmorphismus + Mesh-Gradient-Backgrounds + Spring-Animationen + Inter-Variable-Font umgestellt.
- **Wo umgesetzt:** Praktisch alle Frontend-Files – zentrale Design-Tokens in `src/app.html` (CSS Variables für `--brand-gradient`, `--surface-*`, `--ease-spring`, `--radius-*`), neuer Look in jeder Route.
- **Referenz:** Screenshots `docs/screenshots/redesign-*.png`; Issue Map I1 + I8
- **Aus Evaluation abgeleitet?:** **Ja**, V5 und V8 (Severity 2 + 1, beide TPs)

### 4.6 Mobile-First-Polish (iPhone 16 Pro Max) + Haptic-Feedback

- **Beschreibung & Nutzen:** Die App wurde für die **iPhone-16-Pro-Max-Grösse** (440 × 956 px) optimiert: PWA-Meta-Tags für „Add to Home Screen", Safe-Area-Insets oben/unten, `100dvh` statt `100vh` (iOS-Address-Bar), `touch-action: manipulation` (kein Double-Tap-Zoom), iOS-Style-Bottom-Nav mit Backdrop-Blur, vergrösserte Touch-Targets (≥ 40 px). Zusätzlich **haptisches Feedback** via Web-Vibration-API auf allen interaktiven Aktionen (Toggle, Inc, Dec, Submit, Error). Auf Android fühlbar, auf iOS no-op (visuelles Spring-Feedback bleibt).
- **Wo umgesetzt:**
  - **Foundation:** `src/app.html` – PWA-Meta, Safe-Area-CSS, Hover-Disable auf Touch
  - **Manifest:** `static/manifest.json` (Theme-Color, Standalone, Display)
  - **Haptic-Helper:** `src/lib/haptic.js` – `tap()`, `strongTap()`, `success()`, `warn()`, `error()`
  - **Komponenten:** Alle interaktiven Komponenten importieren `haptic.js` und triggern bei Click/Submit
  - **Bottom-Nav:** `src/routes/+layout.svelte` – iOS-Pill mit FAB rechts aussen
- **Referenz:** Screenshots `docs/screenshots/mobile-*.png`
- **Aus Evaluation abgeleitet?:** **Nein** – proaktive Erweiterung über den Mindestumfang hinaus, motiviert durch Zielgruppen-Analyse („≥ 70 % Mobile-Nutzung").

### 4.7 Heatmap-Period-Selector mit localStorage-Persistenz

- **Beschreibung & Nutzen:** Im Dashboard kann der User den **Zeitraum** der Mini-Heatmaps in jeder Tile zwischen **4 W / 8 W / 14 W / 6 M** umschalten. Auswahl wird im `localStorage` persistiert, sodass beim Reload die zuletzt gewählte Periode aktiv ist.
- **Wo umgesetzt:**
  - **Frontend:** `src/routes/dashboard/+page.svelte` – iOS-Segmented-Control mit `HEATMAP_PERIODS`-Array und `localStorage.setItem('daylq:heatmap-period', id)`
  - **HabitTile:** akzeptiert `weeks`-Prop, Heatmap-Cells haben `--cell-max` mit `justify-content: start` (kompakte Anzeige unabhängig von Periode)
  - **Wochentag- + Monats-Labels:** Mo–So links neben der Heatmap, Monatsnamen oberhalb wo der Monat wechselt
- **Referenz:** Screenshots `docs/screenshots/heatmap-periods-*.png`
- **Aus Evaluation abgeleitet?:** **Nein** – Erweiterung über den Mindestumfang hinaus.

### 4.8 Achievement-Badges (Streaks + Total-Completions)

- **Beschreibung & Nutzen:** Pro Habit gibt es **Streak-Badges** (3 Tage, 7 Tage, 14 Tage, 21 Tage, 30 Tage, 100 Tage, 365 Tage) und **Total-Badges** auf Account-Ebene (10×, 50×, 100×, 365× Completions). Verdiente Badges erscheinen sowohl im Dashboard als auch in der Habit-Detail-Page; das jeweils nächste Badge wird als Progress angezeigt („3 Completions noch").
- **Wo umgesetzt:**
  - **Definitionen:** `src/lib/badges.js` – `STREAK_BADGES`, `TOTAL_BADGES`, `getEarnedBadges()`, `getNextBadge()`
  - **Frontend:** `src/routes/dashboard/+page.svelte` und `src/routes/habits/[id]/+page.svelte` – Badge-Chips mit farbcodiertem Hintergrund
- **Referenz:** Screenshots `docs/screenshots/badges-*.png`
- **Aus Evaluation abgeleitet?:** **Nein** – proaktiv für stärkere Motivation eingebaut.

### 4.9 Light/Dark Theme mit Cross-Component-Sync

- **Beschreibung & Nutzen:** Komplettes **zweites Theme** (Light) inkl. eigener Surface-Palette, Mesh-Background, Schatten-Werte. Switch im Layout-Header (Sun/Moon-Icon) **und** in den Settings (Hell/Dunkel-Buttons). Beide Seiten synchronisieren via Custom-Event `daylq:theme-change`, sodass das Icon im Header immer den aktuellen State zeigt. Theme wird in einem Cookie (1 Jahr) persistiert und initial im `<head>` von `app.html` ohne Flash gesetzt.
- **Wo umgesetzt:**
  - **CSS:** `src/app.html` – `[data-bs-theme='light']` und `[data-bs-theme='dark']` mit kompletten Variable-Overrides
  - **Frontend:** `src/routes/+layout.svelte`, `src/routes/settings/+page.svelte` – `applyTheme()` + Event-Bus
- **Referenz:** Screenshots `docs/screenshots/theme-*.png`
- **Aus Evaluation abgeleitet?:** **Nein** – Komfort-Feature.

### 4.10 Danger-Zone „Alle Daten löschen" in Settings

- **Beschreibung & Nutzen:** In den Settings gibt es eine **Danger-Zone**, in der der User alle Habits, Check-Ins und eigene Kategorien löschen kann (Account bleibt). **Confirmation-Pattern:** User muss exakt `LÖSCHEN` tippen – der Submit-Button bleibt sonst disabled. Erfolgs-Banner zeigt gelöschte Counts.
- **Wo umgesetzt:**
  - **Backend:** `src/routes/settings/+page.server.js` – Action `?/wipe` mit String-Vergleich + parallelem `deleteMany` über drei Collections
  - **Frontend:** `src/routes/settings/+page.svelte` – aufklappbarer Danger-Card mit `confirm-input`, Haptic-Warn beim Öffnen, Haptic-StrongTap beim Confirm
- **Referenz:** Screenshots `docs/screenshots/danger-zone-*.png`
- **Aus Evaluation abgeleitet?:** **Nein** – DSGVO-/Komfort-Feature, vom Autor proaktiv ergänzt.

### 4.11 Dashboard-Empty-State mit Mockup-Hero

- **Beschreibung & Nutzen:** Wenn ein neuer User noch keinen Habit hat, sieht er statt einer leeren Liste einen **emotional ansprechenden Hero** mit drei schwebenden Mockup-Cards (Wasser/Lesen/Meditation mit fiktiven Streaks), Sparkle-Emoji, vier Suggestion-Pills und einem grossen Gradient-CTA „Ersten Habit erstellen →". Reduziert die typische Empty-State-Friktion bei Erstnutzung.
- **Wo umgesetzt:** `src/routes/dashboard/+page.svelte` – `empty-hero`-Block mit Float-Animationen und Shimmer-Emoji
- **Referenz:** Screenshots `docs/screenshots/empty-state-*.png`
- **Aus Evaluation abgeleitet?:** **Nein** – proaktive UX-Verbesserung.

### 4.12 Realistische Test-Daten (Seed-Script)

- **Beschreibung & Nutzen:** Für den Demo-Account `chris.zimmermann@hotmail.ch` wurde ein Seed-Script geschrieben, das **7 realistische Habits** mit **464 Check-Ins über die letzten 90 Tage** und **940 Total-Completions** in die MongoDB schreibt. Verwendet einen Streak-Momentum-Algorithmus (Streaks boosten die Wahrscheinlichkeit am Folgetag, Lücken dippen) für lebensechte Heatmaps, sowie 7 maximal distinkte Hue-Farben für visuelle Diversität.
- **Wo umgesetzt:** `scripts/seed-chris.js` – ESM-Script mit MongoClient, Linear-Congruential-Generator für reproduzierbare Pseudo-Randomness, parametrisierbare Habit-Liste
- **Referenz:** `node scripts/seed-chris.js`
- **Aus Evaluation abgeleitet?:** **Nein** – Demo-Vorbereitung für Video-Walkthrough und Bewertende.

---

## 5. Projektorganisation

- **Repository & Struktur:**
  - **URL:** https://github.com/CH02z/daylq
  - **Sichtbarkeit:** öffentlich
  - Strukturübersicht siehe Kap. 3.4.2 „Struktur & Komponenten"
  - `README.md` (dieses Dokument), `package.json`, `svelte.config.js`, `vite.config.js`, `netlify.toml` im Root

- **Issue-Management:**
  Die aus der Usability Evaluation abgeleiteten Verbesserungen (V1–V8) wurden als Arbeitspakete erfasst und im Repository in der Branch-Strategie umgesetzt. Die Tabelle in Kap. 3.5 dient als Issue-Liste; konkrete Umsetzung dokumentiert in Kap. 4.

- **Commit-Praxis:**
  - Conventional-Commit-Stil (Prefixes wie `feat:`, `fix:`, `chore:`, `style:`, `refactor:`)
  - Sprechende Commits in deutscher Sprache, jeweils ein logisches Thema pro Commit
  - Commit-Historie zeigt Iterationen entlang der Methodik-Phasen

- **Branching:** Hauptentwicklung auf `main`, Feature-Branches für grössere Erweiterungen (z.B. Multi-Goal-Refactor), Merge via Pull-Request nach lokalem Build-Check.

---

## 6. KI-Deklaration

### 6.1 KI-Tools

- **Eingesetzte Tools:**
  - **Claude Code (Claude Sonnet 4.5 / 4.7, CLI Agent)** als primärer KI-Assistent in VS Code – verwendet für Code-Generierung, Refactoring, Design-Iterationen, Debugging sowie für die Strukturierung dieser Dokumentation.
  - **GitHub Copilot (Inline-Completions)** punktuell für Standard-Boilerplate.
- **Zweck & Umfang:**
  - **Code:** Grossteil des Frontend-Codes (Svelte-Komponenten, CSS, State-Management) wurde mit Claude als Pair-Programmer entwickelt: Autor formuliert Anforderung (deutsche Prompts, oft mit Screenshots), Claude generiert Vorschlag, Autor reviewed und iteriert. Speziell bei Design-Iterationen (Glasmorphismus, Bottom-Nav, Heatmap-Layout, Empty-State) lief der Loop „Screenshot → Beschreibung des Problems → KI-Vorschlag → Live-Test → nächste Iteration" über viele Runden.
  - **Backend:** SvelteKit-Form-Actions und MongoDB-Aggregationen entstanden ebenfalls in Co-Produktion. Datenmodell-Entscheidungen (z.B. `count`-Feld vs. mehrere Docs pro Tag, Backwards-Compat-Strategie) wurden vom Autor getroffen und mit KI implementiert.
  - **Dokumentation:** Diese README wurde gemeinsam mit Claude entlang der Moodle-Vorlage erarbeitet. Erik- und Ricardo-Beobachtungsbögen (.docx) wurden im Original verfasst, in dieser README zusammengefasst.
  - **Test-Daten:** Das Seed-Script wurde mit KI generiert nach Vorgabe des Autors (Streak-Momentum, distinkte Farben).
- **Eigene Leistung (Abgrenzung):**
  - **Konzept und Lösungsidee** stammen vollständig vom Autor (Variantenanalyse, Entscheid für Heatmap-Karten-Grid, Trade-offs).
  - **Usability-Evaluation** wurde vom Autor selbst durchgeführt (Test-Aufgaben formuliert, Tests vor Ort moderiert, Beobachtungsbögen handschriftlich erstellt, Issue-Map und Priorisierung erstellt).
  - **Iterations-Entscheide** (welche Issues wann adressiert, welche Erweiterungen über Mindestumfang hinaus) wurden vom Autor getroffen.
  - **Test-Strategie und Verifizierung** des Prototyps (manuelles Durchklicken aller Flows, Edge-Cases, Build-Checks) liegen beim Autor.
  - Code-Reviews und Korrekturen wurden konsequent durchgeführt; jeder KI-Vorschlag wurde gelesen und bei Bedarf angepasst, bevor er ins Repo eingecheckt wurde.

### 6.2 Prompt-Vorgehen

Die Zusammenarbeit mit Claude folgte einem iterativen Muster:

1. **Kontext setzen:** Zu Beginn jeder Session wurde der Stack (SvelteKit 5 Runes, MongoDB, kein TypeScript) und die aktuelle Code-Struktur via Datei-Reads geteilt. Über Code-Kommentare und gepflegte Memory-Files (in der Claude-Code-Session) blieb Kontext über Sessions hinweg erhalten.
2. **Spezifisch und visuell:** Statt „mach das schöner" wurden Prompts wie „im Stil von Apple/Revolut, Glasmorphismus, Bottom-Nav iOS-Style, Spring-Easings" formuliert, oft begleitet von Screenshots des aktuellen Stands.
3. **Iterativ verfeinern:** Nach jedem Vorschlag wurde die App lokal getestet (Browser-Preview), beobachtetes Verhalten zurückgemeldet („auf 4 W zeigt die Heatmap riesige Lücken zwischen den Cells"), und Claude bekam die Chance, gezielt zu fixen.
4. **Quellen-Bewusstsein:** Bei UI-Mustern (z.B. iOS-Bottom-Nav, GitHub-Heatmap) wurde explizit auf etablierte Patterns referenziert. Bei spezifischen API-Fragen (Web-Vibration-API auf iOS, SvelteKit-Cookie-Optionen) wurde Claude für Recherche und Empfehlungen genutzt; kritische Aussagen (z.B. „iOS Safari unterstützt Vibration nicht") wurden anschliessend mit MDN/Apple-Docs verifiziert.
5. **Test-Driven UX:** Verbesserungen aus der Usability-Evaluation wurden zuerst als klare Anforderungen formuliert (z.B. „User braucht Mehrfach-Check-In, Daten-Modell soll backwards-kompatibel bleiben") und dann mit Claude umgesetzt.

**Beispiel-Prompts (exemplarisch, nicht erschöpfend):**

> „Bevor du die Heatmap baust, prüfe die bestehende `HabitTile.svelte`. Bei wenigen Spalten haben die Zellen riesige Lücken. Fix: Grid mit `minmax(0, cell-max)` + `justify-content: start`, sodass Cells links bündig kompakt bleiben."

> „Baue einen Empty-State für das Dashboard wenn der User noch keinen Habit hat. Statt einer leeren Liste: emotional ansprechender Hero mit 3 floating mockup-cards, sparkle emoji, 4 suggestion pills und einem grossen Gradient-CTA. Mobile-First."

### 6.3 Reflexion

- **Nutzen:** Claude hat die Iterations-Geschwindigkeit massiv erhöht. Insbesondere das **komplette Redesign** im Apple/Revolut-Stil über alle ~10 Seiten hinweg wäre in der verfügbaren Zeit ohne KI-Assistenz nicht in dieser Tiefe möglich gewesen. Auch die **Implementation der Evaluations-Erkenntnisse** (Mehrfach-Check-In mit Backwards-Compat, Kategorie-Edit mit Farb-Propagation, Mobile-Polish) profitierte stark von der Möglichkeit, Anforderungen sprachlich zu formulieren und sofort funktionierenden Code zu erhalten.

- **Grenzen:**
  - KI macht in Detailfragen Fehler (z.B. Race-Conditions in optimistischen UI-Updates, Off-By-One bei Animations-Triggern). Diese wurden durch das eigene **QA-Audit** entdeckt und gefixt (siehe Commit-Historie).
  - Visuelle Designentscheidungen brauchen menschliches Auge: „Macht das CTA hier visuell Sinn?" konnte Claude nur eingeschränkt beurteilen – Screenshot-basierte Iteration mit dem Autor war essenziell.
  - KI tendiert zu Over-Engineering: mehrere Vereinfachungen wurden vom Autor durchgesetzt (z.B. keine externen Stores, keine Migration-Skripts, keine TypeScript-Migration).

- **Risiken & Qualitätssicherung:**
  - Jeder generierte Code wurde durchgelesen bevor er commitet wurde
  - Build-Check (`npm run build`) nach jeder grösseren Änderung
  - Manuelles End-to-End-Testing aller Workflows nach dem QA-Audit (Kap. „QA Audit" in der Commit-Historie dokumentiert)
  - Quellenangaben zu UI-Inspirationen (Apple HIG, Revolut, GitHub-Heatmap, NN/g-Severity-Skala) bewusst transparent gemacht
  - **Urheberrecht:** Es wurden keine fremden Assets übernommen. Inter Font ist OFL-lizenziert (https://rsms.me/inter/), Bootstrap-Icons MIT-lizenziert. Alle anderen Assets (Favicon, Mockup-Texte) wurden selbst erstellt.

---

## 7. Anhang

- **Quellen:**
  - **Font:** Inter Variable Font (rsms.me/inter), SIL Open Font License
  - **Icons:** Bootstrap Icons 1.11.3 (MIT-Lizenz)
  - **Framework:** SvelteKit 5, Bootstrap 5.3.3 (beide MIT)
  - **UI-Inspiration:** Apple Human Interface Guidelines, Revolut App, GitHub Heatmap-Pattern
  - **Methodik-Referenz:** Sarodnick & Brau, „Methoden der Usability Evaluation"; Nielsen Norman Group Severity-Skala (https://www.nngroup.com/articles/how-to-rate-the-severity-of-usability-problems/)

- **Testskript & Materialien:**
  - Original-Beobachtungsbögen der Usability-Tests:
    - `daylq_usability_Erik_Grütter.docx` (Testperson 01)
    - `daylq_usability_Ricardo_Hengartner.docx` (Testperson 02)
    - `daylq_usability_beobachtungsbogen.docx` (Leer-Template)

- **Rohdaten / Auswertung:** Issue-Map und Erfolgsquoten in Kap. 3.5; positive Findings tabellarisch ebd. Beobachtungsbögen enthalten Originalzitate und Zeitmessungen.

- **Lokale Entwicklung:**
  ```sh
  # Repository klonen
  git clone https://github.com/CH02z/daylq.git
  cd daylq

  # Abhängigkeiten installieren
  npm install

  # .env mit DB_URI und JWT_SECRET befüllen (siehe .env.example)

  # Dev-Server starten
  npm run dev

  # Produktions-Build
  npm run build
  npm run preview

  # Optional: Demo-Daten in MongoDB seeden
  node scripts/seed-chris.js
  ```

- **Demo-Account** *(für Bewertung):*
  - Email: `chris.zimmermann@hotmail.ch`
  - Passwort: *Auf Anfrage*
  - Inhalt: 7 Habits mit 90 Tagen realistischer Check-In-Historie (940 Completions)

---

*Lizenz: MIT* · *Letzte Aktualisierung: 06.06.2026*
