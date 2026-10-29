# Plan: Kalorien- & Bewegungstracker

Persönliche Web-App für Marit: Essen und Bewegung eintragen, Kalorien schätzen,
Tagesbilanz und Verlauf ansehen. Läuft im Handy-Browser und auf dem Laptop.

## Technik (bewusst einfach)

- **HTML + CSS + JavaScript**, kein Build-Schritt, kein Framework.
  Man öffnet `index.html` – fertig.
- **Chart.js** (über ein CDN eingebunden) für die Diagramme.
- **Veröffentlichung über GitHub Pages** (kostenlos, direkt aus dem Repository).
- **Mobil zuerst**: große Buttons, eine Spalte, später als „App“ auf den
  Homescreen installierbar (PWA).

Geplante Dateistruktur:

```
index.html          Grundgerüst der Seite
css/style.css       Aussehen
js/app.js           Steuerung: Ansichten wechseln, Formulare
js/storage.js       Daten speichern/laden (zuerst Browser, später Sync)
js/foods.js         Lebensmittel-Datenbank inkl. Singapur-Gerichte
js/estimate.js      Freitext → Kalorienschätzung
js/activities.js    MET-Werte für Sportarten
js/calc.js          Formeln: Mifflin-St-Jeor, MET-Verbrauch, Hinweise
js/charts.js        Diagramme
```

## Offene Entscheidung 1: Kalorienschätzung aus Freitext

| Option | Vorteile | Nachteile |
|---|---|---|
| **1. Eigene Datenbank** | kostenlos, offline, schnell, Singapur-Gerichte gezielt pflegbar, keine Daten verlassen das Handy | versteht nur, was in der Liste steht; Freitext wird über Stichwörter + Mengen („2 Scheiben“) erkannt |
| **2. Open Food Facts** | riesige Datenbank, kostenlos, gut für **verpackte** Produkte (Barcode) | kaum Hawker-Gerichte, Daten von Freiwilligen (teils lückenhaft), braucht Internet, versteht keinen Freitext |
| **3. Claude API** | versteht Freitext am besten („Chicken Rice, extra Ei, wenig Reis“), kennt lokale Gerichte | kostet pro Anfrage (Bruchteile eines Cents bis ~1 Cent), braucht kleinen Server für den geheimen API-Schlüssel, Schätzung kann schwanken |

**Empfehlung:** mit **Option 1** starten (eigene Liste mit ca. 150 Gerichten,
Schwerpunkt Singapur) und **Option 3 später als Zusatz** anbieten: Erkennt die
Liste ein Gericht nicht, kann man auf „KI fragen“ tippen. Open Food Facts
bringt für Hawker-Food wenig und kann später für Barcodes ergänzt werden.

## Offene Entscheidung 2: Wo werden die Daten gespeichert?

| Option | Vorteile | Nachteile |
|---|---|---|
| **Nur im Browser** (localStorage) | null Einrichtung, privat, offline | kein Sync zwischen Handy und Laptop; Daten weg, wenn der Browser-Speicher gelöscht wird (Export/Import als Backup hilft) |
| **Supabase** (kostenlose Online-Datenbank mit Login) | Sync zwischen Geräten, Backup, Login per E-Mail-Link; kann auch den geheimen Claude-Schlüssel in einer „Edge Function“ verwahren | ca. 20 Min. Einrichtung (Konto anlegen), Daten liegen bei einem Anbieter |

**Empfehlung:** zuerst im Browser speichern (damit du schnell etwas Funktionierendes
hast), den Speicher-Code aber so bauen, dass Supabase später einfach
„eingesteckt“ werden kann. Mit Supabase wäre dann auch der kleine Server für
die Claude-Schätzung gleich mit erledigt.

## Schritte

1. **Grundgerüst** – Seite, Navigation (Heute / Verlauf / Einstellungen),
   Handy-Layout, GitHub Pages einschalten.
2. **Einstellungen** – Gewicht, Größe, Alter, Geschlecht, Aktivitätslevel →
   Grundumsatz (Mifflin-St-Jeor) und Gesamtbedarf; Tagesziel festlegen,
   Hinweis bei zu niedrigem Ziel.
3. **Essen eintragen** – Freitext + Mahlzeit, Schätzung, manuelle Korrektur,
   Favoriten.
4. **Bewegung eintragen** – Aktivität, Dauer, Intensität → MET × kg × Stunden,
   manuelle Korrektur (Smartwatch-Wert).
5. **Tagesübersicht** – gegessen − verbraucht = netto, Fortschrittsbalken,
   Einträge bearbeiten/löschen, zwischen Tagen wechseln.
6. **Verlauf & Gewicht** – Gewicht eintragen, Diagramme (7/30 Tage,
   Gewicht), Wochenübersicht.
7. **Sync** (je nach Entscheidung) – Supabase mit Login.
8. **KI-Schätzung** (optional) – Claude über Supabase Edge Function.

Nach jedem Schritt: kurze Erklärung + Anleitung zum Testen.

## Gesundheit & Datenschutz

- Hinweise statt Belohnung, wenn das Ziel unter ca. 1200 kcal (bzw. unter dem
  Grundumsatz) liegt oder die tatsächliche Zufuhr sehr niedrig ist.
- Keine persönlichen Daten und keine API-Schlüssel im Repository.
  Persönliche Werte bleiben im Browser bzw. in der eigenen Datenbank;
  Geheimnisse landen nur in den Supabase-Einstellungen.
