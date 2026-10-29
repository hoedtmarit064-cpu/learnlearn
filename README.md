# Calorie & Activity Tracker

A simple personal web app: log what you eat and how you move, get calorie
estimates (with lots of Singapore hawker food), and see your daily balance,
charts and weight trend.

Plain HTML, CSS and JavaScript – no installation, no build step.

## Try it

- **On your computer:** download/clone the repository and double-click `index.html`.
- **Online (phone + laptop):** turn on GitHub Pages (see below) and open the link.
- **On your phone like an app:** open the link in Safari → Share → “Add to Home Screen”.

## Turn on GitHub Pages

1. On GitHub, open the repository → **Settings** → **Pages**.
2. Under “Build and deployment”, choose **Deploy from a branch**.
3. Pick the branch (e.g. `main`) and the folder `/ (root)`, then **Save**.
4. After a minute the address appears at the top, like
   `https://<username>.github.io/learnlearn/`.

## Where is my data?

Only in the browser of the device you use (localStorage). Nothing is sent
anywhere and nothing personal is stored in this repository. Phone and laptop
therefore have separate data for now – use **Settings → Export / Import backup**
to move it. Online sync is planned as a next step.

## Files

| File | What it does |
|---|---|
| `index.html` | the page: all screens and dialogs |
| `css/style.css` | look & feel (incl. dark mode) |
| `js/foods.js` | food database – add your own foods here |
| `js/activities.js` | sports and their MET values |
| `js/calc.js` | formulas: BMR (Mifflin-St Jeor), exercise burn, goal checks |
| `js/estimate.js` | turns free text like “2 slices bread with cheese” into calories |
| `js/storage.js` | saving and loading data |
| `js/charts.js` | the charts |
| `js/app.js` | connects everything with the page |

See `PLAN.md` for the full plan and next steps.
