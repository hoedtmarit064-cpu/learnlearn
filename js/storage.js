// ------------------------------------------------------------
// Storage
//
// All data is kept in ONE object and saved in the browser's
// localStorage, so the app also works offline.
//
// For syncing (see sync.js) every record gets an `updatedAt` time and
// every change is noted in `sync.dirty` until it has been uploaded.
// Records are: food/exercise entries, weights, favourites, settings.
// ------------------------------------------------------------

const STORAGE_KEY = "calorie-tracker-v1";

const DEFAULT_SETTINGS = {
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
};

const DEFAULT_DATA = {
  settings: DEFAULT_SETTINGS,
  entries: [],    // food and exercise entries
  weights: [],    // { date, kg }
  favorites: [],  // { id, text, kcal, protein }
  sync: {
    userId: null,      // account the local data was last synced with
    lastPulled: null,  // server time of the newest change we downloaded
    dirty: {},         // id → { kind, deleted, updatedAt } waiting for upload
  },
};

const Store = {
  data: null,
  onLocalChange: null,   // set by sync.js: called after every change

  load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      this.data = Object.assign(structuredClone(DEFAULT_DATA), saved || {});
      this.data.settings = Object.assign(structuredClone(DEFAULT_SETTINGS), this.data.settings);
      this.data.sync = Object.assign(structuredClone(DEFAULT_DATA.sync), this.data.sync);
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

  // Note a change for syncing, save, and tell sync.js. Returns the time.
  changed(kind, id, deleted = false) {
    const updatedAt = Date.now();
    this.data.sync.dirty[id] = { kind, deleted, updatedAt };
    this.save();
    if (this.onLocalChange) this.onLocalChange();
    return updatedAt;
  },

  // ----- entries -----
  entriesFor(date) {
    return this.data.entries.filter(e => e.date === date);
  },
  saveEntry(entry) {
    const i = this.data.entries.findIndex(e => e.id === entry.id);
    if (i >= 0) this.data.entries[i] = entry;
    else this.data.entries.push(entry);
    entry.updatedAt = this.changed("entry", entry.id);
    this.save();
  },
  deleteEntry(id) {
    this.data.entries = this.data.entries.filter(e => e.id !== id);
    this.changed("entry", id, true);
  },

  // ----- weight -----
  saveWeight(date, kg) {
    this.data.weights = this.data.weights.filter(w => w.date !== date);
    const record = { date, kg };
    this.data.weights.push(record);
    this.data.weights.sort((a, b) => a.date.localeCompare(b.date));
    record.updatedAt = this.changed("weight", "w:" + date);
    // the newest weight is also the "current weight" for calculations
    this.saveSettings({ weight: this.data.weights[this.data.weights.length - 1].kg });
  },
  deleteWeight(date) {
    this.data.weights = this.data.weights.filter(w => w.date !== date);
    this.changed("weight", "w:" + date, true);
  },

  // ----- favourites -----
  addFavorite(fav) {
    const exists = this.data.favorites.some(f => f.text.toLowerCase() === fav.text.toLowerCase());
    if (exists) return;
    this.data.favorites.push(fav);
    fav.updatedAt = this.changed("favorite", fav.id);
    this.save();
  },
  deleteFavorite(id) {
    this.data.favorites = this.data.favorites.filter(f => f.id !== id);
    this.changed("favorite", id, true);
  },

  // ----- settings -----
  saveSettings(settings) {
    Object.assign(this.data.settings, settings);
    this.data.settings.updatedAt = this.changed("settings", "settings");
    this.save();
  },

  // ----- backup -----
  exportJSON() {
    const { sync, ...rest } = this.data;
    return JSON.stringify(rest, null, 2);
  },
  importJSON(text) {
    const parsed = JSON.parse(text);
    if (!parsed || !Array.isArray(parsed.entries)) throw new Error("Not a backup file");
    const sync = this.data.sync;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, sync }));
    this.load();
    // upload everything from the backup
    const now = Date.now();
    this.forEachRecord((kind, id, rec) => {
      rec.updatedAt = now;
      this.data.sync.dirty[id] = { kind, deleted: false, updatedAt: now };
    });
    this.save();
    if (this.onLocalChange) this.onLocalChange();
  },
  reset() {
    // delete everything here AND (when synced) in the cloud
    const dirty = this.data.sync.dirty;
    const now = Date.now();
    this.forEachRecord((kind, id) => { dirty[id] = { kind, deleted: true, updatedAt: now }; });
    const sync = this.data.sync;
    this.data = structuredClone(DEFAULT_DATA);
    this.data.sync = sync;
    this.save();
    if (this.onLocalChange) this.onLocalChange();
  },

  // ============================================================
  // Helpers for sync.js
  // ============================================================

  // Calls fn(kind, id, record) for every record
  forEachRecord(fn) {
    for (const e of this.data.entries) fn("entry", e.id, e);
    for (const w of this.data.weights) fn("weight", "w:" + w.date, w);
    for (const f of this.data.favorites) fn("favorite", f.id, f);
    if (this.data.settings.setupDone) fn("settings", "settings", this.data.settings);
  },

  findRecord(kind, id) {
    if (kind === "entry") return this.data.entries.find(e => e.id === id);
    if (kind === "favorite") return this.data.favorites.find(f => f.id === id);
    if (kind === "weight") return this.data.weights.find(w => "w:" + w.date === id);
    if (kind === "settings") return this.data.settings;
    return null;
  },

  // The record as it is uploaded (without our sync time)
  recordData(kind, id) {
    const rec = this.findRecord(kind, id);
    if (!rec) return null;
    const { updatedAt, ...data } = rec;
    return data;
  },

  // Apply one record downloaded from the cloud. Newer wins.
  // Returns true if something changed here.
  applyRemote(row) {
    const remoteTime = Date.parse(row.updated_at);
    const pending = this.data.sync.dirty[row.id];
    if (pending && pending.updatedAt >= remoteTime) return false;   // our change is newer
    if (pending) delete this.data.sync.dirty[row.id];

    const local = this.findRecord(row.kind, row.id);

    if (row.kind === "settings") {
      const s = this.data.settings;
      if (row.deleted || (s.setupDone && (s.updatedAt || 0) >= remoteTime)) return false;
      this.data.settings = Object.assign(structuredClone(DEFAULT_SETTINGS), row.data, { updatedAt: remoteTime });
      return true;
    }

    if (local && (local.updatedAt || 0) >= remoteTime) return false;

    const listName = { entry: "entries", weight: "weights", favorite: "favorites" }[row.kind];
    if (!listName) return false;
    const list = this.data[listName].filter(r => r !== local);

    if (!row.deleted) {
      list.push({ ...row.data, updatedAt: remoteTime });
      if (row.kind === "weight") list.sort((a, b) => a.date.localeCompare(b.date));
    }
    this.data[listName] = list;
    return !!local || !row.deleted;
  },

  // First sync with an account: upload everything that the cloud
  // doesn't have yet or that is newer here.
  markLocalNewerThan(serverTimes) {
    this.forEachRecord((kind, id, rec) => {
      rec.updatedAt = rec.updatedAt || 1;      // old data without a time counts as "very old"
      if (!(id in serverTimes) || rec.updatedAt > serverTimes[id]) {
        this.data.sync.dirty[id] = { kind, deleted: false, updatedAt: rec.updatedAt };
      }
    });
    this.save();
  },
};

// Unique id for new entries
function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
