# daylq – Habit Tracker

Ein minimalistischer, mobilfreundlicher Habit-Tracker, entwickelt im Rahmen des Moduls **Prototyping** an der ZHAW School of Management and Law.

**Tech-Stack:** SvelteKit 5 · MongoDB · Bootstrap 5 · JWT-Auth (httpOnly Cookies)

---

## Entwicklung

```sh
npm install
npm run dev
```

Produktions-Build:

```sh
npm run build
npm run preview
```

---

## 1. Usability Evaluation

> Dokumentation der durchgeführten Usability Evaluation gemäss Vorlage (Modul Prototyping, ZHAW SML).

### 1.1 Getestete Version

- **URL:** *(separat deployt unter Netlify – Snapshot der evaluierten Version)*
- **Stand:** 20.05.2026
- **Screenshots:** siehe Ordner `/docs/screenshots/` *(folgt)*

### 1.2 Ziele der Evaluation

Mit der Evaluation sollten folgende Fragen beantwortet werden:

- Ist die **Erstregistrierung** und das **Anlegen eines ersten Habits** ohne Hilfe in unter 3 Minuten möglich?
- Werden die **zentralen Interaktionen** (Abhaken, Notiz hinzufügen, Fortschritt einsehen) intuitiv erkannt?
- Sind die **visuellen Komponenten** (Streak, Heatmap, Badges) verständlich und motivierend?
- Werden **administrative Funktionen** (Habit bearbeiten/löschen, Kategorien verwalten, Erinnerungen) gefunden, ohne dass Hinweise nötig sind?
- Wie wird das **Gesamt-Design** wahrgenommen – passt es zur Zielgruppe?

### 1.3 Vorgehen

- **Methode:** Moderierter Usability-Test mit Laut-Denken-Methode (Thinking Aloud)
- **Setting:** On-Site, ZHAW Winterthur (Lab)
- **Dauer pro Test:** ca. 10 Minuten + 5 Minuten Abschlussgespräch
- **Aufzeichnung:** Beobachtungsbogen pro Testperson (siehe `daylq_usability_<Name>.docx`)
- **Testleitung:** Selbst durchgeführt, eine Testperson zur Zeit

### 1.4 Stichprobe

| # | Name | Profil | Gerät |
|---|---|---|---|
| 01 | Erik Grütter | Mitstudent ZHAW, App-affin, kein Vorwissen zur App | iPhone 14 (Safari) |
| 02 | Ricardo Hengartner | Mitstudent ZHAW, gelegentlicher Habit-Tracker-Nutzer | MacBook Pro 14" (Chrome) |

**Anzahl Testpersonen:** 2

### 1.5 Aufgaben / Szenarien

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

### 1.6 Kennzahlen & Beobachtungen

#### Erfolgsquote & Zeitbedarf

| Aufgabe | Erik (TP 01) | Ricardo (TP 02) | Erfolg gesamt |
|---|---|---|---|
| 1 – Konto erstellen | ✅ 1:12 | ✅ 0:58 | 2/2 |
| 2 – Habit anlegen | ✅ 1:48 | ✅ 1:32 | 2/2 |
| 3 – Abhaken + Notiz | ✅ 0:55 | ✅ 0:47 | 2/2 |
| 4 – Fortschritt einsehen | ✅ 0:32 | ✅ 0:38 | 2/2 |
| 5 – Habit anpassen | ✅ 1:25 | ✅ 1:50 | 2/2 |
| 6 – Eigene Kategorie | ✅ 1:38 | ✅ 1:20 | 2/2 |
| 7 – Habit entfernen | ✅ 0:41 | ✅ 0:35 | 2/2 |

**Erfolgsquote: 100% (14/14 Aufgaben ohne Hilfe abgeschlossen)**
**Ø Aufgabenzeit: 1:09 min**

#### Issue Map

Schweregrad-Skala nach Nielsen Norman Group:
**0** = Kein Problem · **1** = Kosmetisch · **2** = Klein · **3** = Gross · **4** = Katastrophe

| Arbeitsschritt | Issue | TP 01 (Erik) | TP 02 (Ricardo) | Severity |
|---|---|---|---|---|
| **Auth / Start** | Login-/Registrierungs-Seite wirkt zu hell, Kontrastbruch zum Dark-UI | «Die Farben sind hier viel zu hell – passt gar nicht zum Rest.» | «Hier wirkt alles ein bisschen wie geblendet – sehr hell.» | **2** |
| **Dashboard** | Vielzahl an Akzentfarben (eine pro Habit) wirkt unruhig | beobachtet, in Anmerkungen erwähnt | «Wenn ich später 10 Habits habe, wird das hier ein Farbtopf.» | **2** |
| **Dashboard** | Keine Filter-/Sortiermöglichkeit nach Kategorie | in Anmerkungen erwähnt | «Auf der Übersicht würde ich gern z.B. nur Sport-Habits sehen können.» | **3** |
| **Abhaken** | Habit kann nur einmal pro Tag abgehakt werden | «Warum kann ich das nur einmal pro Tag machen?» | «Bei Wasser-Trinken oder Sport-Sets wäre Mehrfach-Abhaken pro Tag echt wichtig.» | **3** |
| **Abhaken** | Notizfeld erscheint erst nach dem Abhaken – wenig sichtbar | «Ah, das Notizfeld kommt erst danach – nicht ganz offensichtlich.» | – (positiv erwähnt) | **1** |
| **Habit erstellen** | Erinnerungs-Konfiguration nicht beim Erstellen, sondern erst beim Bearbeiten | «Eigentlich würde ich erwarten, dass mich die App jetzt direkt fragt, wann ich erinnert werden will.» | «Warum fragt mich der Browser jetzt erst nach Benachrichtigungen?» | **3** |
| **Kategorien** | Eigene Kategorien können nicht umbenannt/bearbeitet werden (nur löschen) | «Ich kann sie löschen, aber nicht umbenennen? Wirkt unfertig.» | «Wenn ich eine eigene Kategorie habe, will ich die auch nachträglich anpassen können – Name UND Farbe.» | **2** |
| **Allgemein** | Design wirkt zu Bootstrap-nah, wenig eigenständig | in Anmerkungen erwähnt | in Anmerkungen erwähnt | **1** |

#### Positive Findings

| Aspekt | Quelle |
|---|---|
| Heatmap-Visualisierung wirkt motivierend | TP 01 |
| Sicherheitsabfrage beim Löschen wird explizit gelobt | TP 01, TP 02 |
| Streak-Anzeige (🔥) sofort verständlich | TP 01, TP 02 |
| Symbol- und Kategorieauswahl beim Habit-Erstellen klar | TP 01 |
| Notizfunktion beim Abhaken positiv aufgenommen | TP 02 |
| Habit-Erstellungsflow klar strukturiert | TP 02 |

### 1.7 Zusammenfassung der Resultate

Beide Testpersonen konnten **alle Kernaufgaben ohne Hilfe** in zügiger Zeit lösen, was auf eine grundsätzlich solide User Experience hinweist. Streak, Heatmap und die Sicherheitsabfrage beim Löschen wurden ausdrücklich positiv hervorgehoben. **Hauptkritikpunkte** betreffen drei Bereiche: (1) das fehlende Mehrfach-Abhaken pro Tag, das für bestimmte Habit-Typen (Wasser, Sport) eine echte Limitierung darstellt; (2) die zu späte Abfrage der Erinnerungs-Einstellung, die erst beim Bearbeiten statt beim Erstellen erscheint; (3) den Kontrastbruch zwischen den hellen Auth-Seiten und dem ansonsten dunklen App-Design. Insgesamt wirkt das Konzept tragfähig – die Ableitungen betreffen Detailverbesserungen, kein grundlegender Konzeptwechsel.

### 1.8 Abgeleitete Verbesserungen

Priorisiert nach Severity und Häufigkeit:

| # | Verbesserung | Priorität | Begründung |
|---|---|---|---|
| **V1** | Mehrfach-Abhaken pro Tag ermöglichen (Habit-Typ "zählbar" mit Tageszielwert) | **Hoch** | Severity 3, beide Testpersonen genannt; relevant für ganze Habit-Klassen (Wasser, Sport-Sets) |
| **V2** | Erinnerungszeit direkt im Habit-Erstellen-Flow abfragen inkl. Browser-Berechtigung | **Hoch** | Severity 3, beide TPs; aktueller Flow verlangt zweiten Bearbeitungsschritt |
| **V3** | Kategorie-Filter / Tabs auf dem Dashboard | **Hoch** | Severity 3; skaliert nicht ohne Filterung bei vielen Habits |
| **V4** | Eigene Kategorien bearbeitbar machen (Name + Farbe) | **Mittel** | Severity 2, beide TPs; aktuell nur Löschen möglich |
| **V5** | Auth-Seiten (Login/Register) farblich an Dark-UI angleichen | **Mittel** | Severity 2, beide TPs; Kontrastbruch wirkt unprofessionell |
| **V6** | Dashboard-Farbgebung reduzieren (z.B. Akzentfarbe nur pro Kategorie statt pro Habit) | **Mittel** | Severity 2; reduziert visuelle Unruhe bei mehr Habits |
| **V7** | Notizfeld stärker hervorheben oder Hinweis nach Abhaken | **Niedrig** | Severity 1; nur eine TP, leicht entdeckbar |
| **V8** | Design eigenständiger gestalten (weg vom Bootstrap-Standard) | **Niedrig** | Severity 1; subjektiver Eindruck, kein konkreter Workflow-Blocker |

> **Hinweis:** Konkret im Prototyp umgesetzte Verbesserungen werden in Kapitel 4 (Iteration) der Projektdokumentation festgehalten.

---

## Lizenz

MIT
