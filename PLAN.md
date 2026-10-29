# Plan: Calorie & Activity Tracker

A personal web app for Marit: log food and exercise, estimate calories,
see the daily balance and history. Works in the phone browser and on the laptop.

## Tech (deliberately simple)

- **HTML + CSS + JavaScript**, no build step, no framework.
  Open `index.html` – done.
- **Chart.js** (loaded from a CDN) for the charts.
- **Hosting via GitHub Pages** (free, straight from the repository).
- **Mobile first**: big buttons, one column, later installable as an "app"
  on the home screen (PWA).

Planned file structure:

```
index.html          Page skeleton
css/style.css       Styling
js/app.js           Control: switching views, forms
js/storage.js       Save/load data (browser first, sync later)
js/foods.js         Food database incl. Singapore dishes
js/estimate.js      Free text → calorie estimate
js/activities.js    MET values for activities
js/calc.js          Formulas: Mifflin-St Jeor, MET burn, warnings
js/charts.js        Charts
```

## Open decision 1: Estimating calories from free text

| Option | Pros | Cons |
|---|---|---|
| **1. Own database** | free, offline, fast, Singapore dishes can be curated, no data leaves the phone | only understands what's in the list; free text is matched via keywords + amounts ("2 slices") |
| **2. Open Food Facts** | huge database, free, good for **packaged** products (barcode) | hardly any hawker dishes, volunteer data (sometimes incomplete), needs internet, doesn't understand free text |
| **3. Claude API** | understands free text best ("chicken rice, extra egg, less rice"), knows local dishes | costs per request (a fraction of a cent to ~1 cent), needs a small server for the secret API key, estimates can vary |

**Recommendation:** start with **option 1** (own list of ~150 dishes, focus
on Singapore) and **add option 3 later**: if the list doesn't recognise a
dish, tap "Ask AI". Open Food Facts adds little for hawker food and can be
added later for barcodes.

## Open decision 2: Where is the data stored?

| Option | Pros | Cons |
|---|---|---|
| **Browser only** (localStorage) | zero setup, private, offline | no sync between phone and laptop; data is lost if browser storage is cleared (export/import as backup helps) |
| **Supabase** (free online database with login) | sync across devices, backup, login via email link; can also keep the secret Claude key in an "Edge Function" | ~20 min setup (create an account), data is stored with a provider |

**Recommendation:** store in the browser first (so you get something working
quickly), but build the storage code so Supabase can be "plugged in" later.
Supabase would then also provide the small server for the Claude estimate.

## Steps

**Status:** steps 1–7 are done. Sync via Supabase (email + password login) is built.

1. **Skeleton** – page, navigation (Today / History / Settings),
   mobile layout, enable GitHub Pages.
2. **Settings** – weight, height, age, sex, activity level →
   BMR (Mifflin-St Jeor) and total daily energy expenditure; set daily goal,
   warning if the goal is too low.
3. **Log food** – free text + meal, estimate, manual correction, favourites.
4. **Log activity** – activity, duration, intensity → MET × kg × hours,
   manual correction (smartwatch value).
5. **Daily overview** – eaten − burned = net, progress bar,
   edit/delete entries, switch between days.
6. **History & weight** – log weight, charts (7/30 days, weight),
   weekly summary.
7. **Sync** (depending on decision) – Supabase with login.
8. **AI estimate** (optional) – Claude via Supabase Edge Function.

After each step: short explanation + instructions for testing.

## Health & privacy

- Friendly warnings instead of rewards when the goal is below ~1200 kcal
  (or below BMR) or actual intake is very low.
- No personal data and no API keys in the repository.
  Personal values stay in the browser or in your own database;
  secrets only live in the Supabase settings.
