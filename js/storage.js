// ------------------------------------------------------------
// Storage
//
// All data is kept in ONE object and saved in the browser's
// localStorage. Nothing is sent anywhere.
//
// Everything else in the app only talks to `Store`, so later we can
// swap the inside of this file for an online database (sync) without
// changing the rest of the app.
// ------------------------------------------------------------

const STORAGE_KEY = "calorie-tracker-v1";

const DEFAULT_DATA = {
  settings: {
    sex: "female",
    age: 30,
    height: 165,
    weight: 65,
    goalWeight: null,
    activity: "1.375",
    deficit: "400",
    customGoalOn: false,
    customGoal: null,
    setupDone: false,
  },
  entries: [],    // food and exercise entries
  weights: [],    // { date, kg }
  favorites: [],  // { id, text, kcal, protein }
};

const Store = {
  data: null,

  load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      this.data = Object.assign(structuredClone(DEFAULT_DATA), saved || {});
      this.data.settings = Object.assign(structuredClone(DEFAULT_DATA.settings), this.data.settings);
    } catch (e) {
      this.data = structuredClone(DEFAULT_DATA);
    }
  },

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      alert("Could not save – is the browser storage full or blocked (private mode)?");
    }
  },

  // ----- entries -----
  entriesFor(date) {
    return this.data.entries.filter(e => e.date === date);
  },
  saveEntry(entry) {
    const i = this.data.entries.findIndex(e => e.id === entry.id);
    if (i >= 0) this.data.entries[i] = entry;
    else this.data.entries.push(entry);
    this.save();
  },
  deleteEntry(id) {
    this.data.entries = this.data.entries.filter(e => e.id !== id);
    this.save();
  },

  // ----- weight -----
  saveWeight(date, kg) {
    this.data.weights = this.data.weights.filter(w => w.date !== date);
    this.data.weights.push({ date, kg });
    this.data.weights.sort((a, b) => a.date.localeCompare(b.date));
    // the newest weight is also the "current weight" for calculations
    this.data.settings.weight = this.data.weights[this.data.weights.length - 1].kg;
    this.save();
  },
  deleteWeight(date) {
    this.data.weights = this.data.weights.filter(w => w.date !== date);
    this.save();
  },

  // ----- favourites -----
  addFavorite(fav) {
    const exists = this.data.favorites.some(f => f.text.toLowerCase() === fav.text.toLowerCase());
    if (!exists) this.data.favorites.push(fav);
    this.save();
  },
  deleteFavorite(id) {
    this.data.favorites = this.data.favorites.filter(f => f.id !== id);
    this.save();
  },

  // ----- settings -----
  saveSettings(settings) {
    this.data.settings = Object.assign(this.data.settings, settings);
    this.save();
  },

  // ----- backup -----
  exportJSON() {
    return JSON.stringify(this.data, null, 2);
  },
  importJSON(text) {
    const parsed = JSON.parse(text);
    if (!parsed || !Array.isArray(parsed.entries)) throw new Error("Not a backup file");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    this.load();
  },
  reset() {
    localStorage.removeItem(STORAGE_KEY);
    this.load();
  },
};

// Unique id for new entries
function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
