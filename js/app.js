// ------------------------------------------------------------
// App: connects the page (index.html) with data and calculations
// ------------------------------------------------------------

const MEALS = [
  { id: "breakfast", name: "Breakfast" },
  { id: "lunch", name: "Lunch" },
  { id: "dinner", name: "Dinner" },
  { id: "snack", name: "Snacks" },
];
const PROTEIN_PER_KG = 1.6;   // g protein per kg body weight – helps keep muscle while losing fat
const KCAL_PER_KG_FAT = 7700;

const $ = id => document.getElementById(id);

let currentDate = todayKey();
let historyRange = 7;
let editingId = null;         // id of the entry being edited (null = new)

// ---------- Date helpers ----------
// Dates are stored as "YYYY-MM-DD" in local time.
function toKey(d) {
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function fromKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function todayKey() { return toKey(new Date()); }
function addDays(key, n) {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}
function shortDate(key) {
  return fromKey(key).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function dayLabel(key) {
  if (key === todayKey()) return "Today";
  if (key === addDays(todayKey(), -1)) return "Yesterday";
  return fromKey(key).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

// Escape text before putting it into HTML (so typed text can't break the page)
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function dayTotals(key) {
  const entries = Store.entriesFor(key);
  const food = entries.filter(e => e.type === "food");
  const acts = entries.filter(e => e.type === "activity");
  const eaten = food.reduce((s, e) => s + Number(e.kcal || 0), 0);
  const burned = acts.reduce((s, e) => s + Number(e.kcal || 0), 0);
  const protein = food.reduce((s, e) => s + Number(e.protein || 0), 0);
  return { food, acts, eaten, burned, protein, net: eaten - burned };
}

// ============================================================
// Navigation between the three views
// ============================================================
function showView(name) {
  for (const v of ["today", "history", "settings"]) $(`view-${v}`).hidden = v !== name;
  document.querySelectorAll(".tabbar button").forEach(b =>
    b.classList.toggle("active", b.dataset.view === name));
  $("view-title").textContent = { today: "Today", history: "History", settings: "Settings" }[name];
  if (name === "today") renderToday();
  if (name === "history") renderHistory();
  if (name === "settings") renderSettings();
  window.scrollTo(0, 0);
}

// ============================================================
// TODAY
// ============================================================
function renderToday() {
  const s = Store.data.settings;
  const t = dayTotals(currentDate);
  const goal = dailyGoal(s);

  $("day-label").textContent = dayLabel(currentDate);
  $("day-next").disabled = currentDate >= todayKey();
  $("view-title").textContent = currentDate === todayKey() ? "Today" : "Diary";

  $("sum-eaten").textContent = t.eaten;
  $("sum-burned").textContent = t.burned;
  $("sum-net").textContent = t.net;

  // Progress bar
  const bar = $("progress-bar");
  const pct = goal > 0 ? (t.net / goal) * 100 : 0;
  bar.style.width = Math.max(0, Math.min(100, pct)) + "%";
  bar.className = "progress-bar";

  const isPast = currentDate < todayKey();
  const dayIsOver = isPast || new Date().getHours() >= 19;
  let text;
  if (t.net > goal * 1.05) {
    bar.classList.add("over");
    text = `${t.net - goal} kcal over your goal of ${goal} — no stress, one day doesn't change much.`;
  } else if (t.net >= goal * 0.9) {
    text = `Right around your goal of ${goal} kcal.`;
  } else {
    if (dayIsOver && t.eaten > 0) bar.classList.add("low");
    text = `${goal - t.net} kcal left of your goal (${goal} kcal).`;
  }
  $("progress-text").textContent = text;

  const proteinGoal = Math.round(s.weight * PROTEIN_PER_KG);
  $("protein-text").textContent = `Protein: ${t.protein} g of ~${proteinGoal} g`;

  // Friendly warning if intake is very low
  const notice = $("day-notice");
  if (dayIsOver && t.eaten > 0 && t.net < 1000) {
    notice.hidden = false;
    notice.textContent = t.burned > 0
      ? `Your net intake is quite low (${t.net} kcal) after ${t.burned} kcal of exercise. Your body needs fuel to recover — please eat something proper, ideally with protein.`
      : `You've eaten quite little${isPast ? " that day" : " today"} (${t.eaten} kcal). Eating too little tends to backfire — a balanced meal or snack would be a good idea.`;
  } else {
    notice.hidden = true;
  }

  renderEntryList(t);
}

function renderEntryList(t) {
  let html = "";
  for (const meal of MEALS) {
    const items = t.food.filter(e => e.meal === meal.id);
    if (!items.length) continue;
    const sum = items.reduce((s, e) => s + Number(e.kcal), 0);
    html += `<div class="card group"><h3>${meal.name}<span>${sum} kcal</span></h3><ul class="list">`;
    for (const e of items) {
      html += entryRow(e, esc(e.text), e.protein ? `${e.protein} g protein` : "");
    }
    html += "</ul></div>";
  }
  if (t.acts.length) {
    html += `<div class="card group"><h3>Exercise<span>−${t.burned} kcal</span></h3><ul class="list">`;
    for (const e of t.acts) {
      const a = findActivity(e.activity);
      html += entryRow(e, esc(a.name), `${e.minutes} min · ${e.intensity}${e.manual ? " · own value" : ""}`);
    }
    html += "</ul></div>";
  }
  if (!html) html = '<p class="empty">Nothing logged yet. Tap “+ Food” or “+ Exercise”.</p>';
  $("day-entries").innerHTML = html;
}

function entryRow(e, title, sub) {
  return `<li>
    <div class="grow" data-edit="${e.id}">${title}<span class="sub">${sub}</span></div>
    <span class="kcal">${e.kcal}</span>
    <button class="mini" data-edit="${e.id}" aria-label="Edit">✎</button>
    <button class="mini" data-delete="${e.id}" aria-label="Delete">🗑</button>
  </li>`;
}

function onEntryListClick(ev) {
  const editId = ev.target.closest("[data-edit]")?.dataset.edit;
  const deleteId = ev.target.closest("[data-delete]")?.dataset.delete;
  if (deleteId) {
    if (confirm("Delete this entry?")) { Store.deleteEntry(deleteId); renderToday(); }
    return;
  }
  if (editId) {
    const entry = Store.data.entries.find(e => e.id === editId);
    if (entry?.type === "food") openFoodDialog(entry);
    if (entry?.type === "activity") openActivityDialog(entry);
  }
}

// ============================================================
// FOOD DIALOG
// ============================================================
function mealForNow() {
  const h = new Date().getHours() + new Date().getMinutes() / 60;
  if (h < 10.5) return "breakfast";
  if (h < 15) return "lunch";
  if (h < 17.5) return "snack";
  if (h < 22) return "dinner";
  return "snack";
}

function openFoodDialog(entry = null) {
  const form = $("food-form");
  form.reset();
  editingId = entry?.id || null;
  $("food-dialog-title").textContent = entry ? "Edit food" : "Add food";

  form.meal.value = entry?.meal || mealForNow();
  form.text.value = entry?.text || "";
  form.kcal.value = entry?.kcal ?? "";
  form.protein.value = entry?.protein ?? "";
  form.kcal.dataset.manual = entry?.manual ? "1" : "";
  updateFoodEstimate(false);

  // Favourites: one tap = logged (only when adding, not when editing)
  const chips = $("fav-chips");
  chips.innerHTML = entry ? "" : Store.data.favorites.map(f =>
    `<button type="button" class="chip" data-fav="${f.id}">★ ${esc(f.text)} · ${f.kcal}</button>`).join("");

  $("food-dialog").returnValue = "";
  $("food-dialog").showModal();
}

// Show the estimate for the typed text. If the user hasn't typed their own
// kcal value, fill the fields with the estimate.
function updateFoodEstimate(fillFields = true) {
  const form = $("food-form");
  const box = $("food-estimate");
  const text = form.text.value.trim();
  if (!text) { box.innerHTML = ""; return; }

  const r = estimateFood(text);
  let html = "";
  if (r.items.length) {
    html += "<ul>" + r.items.map(it =>
      `<li>${esc(it.label)} ${esc(it.name)} — ${it.kcal} kcal</li>`).join("") + "</ul>";
  } else {
    html += "No match in the food list — please enter the calories yourself.";
  }
  if (r.unknown.length && r.items.length) {
    html += `<span class="unknown">Not recognised: ${esc(r.unknown.join(", "))} — add these yourself if they matter.</span>`;
  }
  box.innerHTML = html;

  if (fillFields && !form.kcal.dataset.manual && r.items.length) {
    form.kcal.value = r.kcal;
    form.protein.value = r.protein;
  }
}

function saveFoodFromForm() {
  const form = $("food-form");
  const old = Store.data.entries.find(e => e.id === editingId);
  const entry = {
    id: editingId || newId(),
    date: old?.date || currentDate,
    type: "food",
    meal: form.meal.value,
    text: form.text.value.trim(),
    kcal: Math.round(Number(form.kcal.value) || 0),
    protein: Math.round(Number(form.protein.value) || 0),
    manual: !!form.kcal.dataset.manual,
  };
  Store.saveEntry(entry);
  if (form.favorite.checked) {
    Store.addFavorite({ id: newId(), text: entry.text, kcal: entry.kcal, protein: entry.protein });
  }
  renderToday();
}

function logFavorite(favId) {
  const f = Store.data.favorites.find(x => x.id === favId);
  if (!f) return;
  Store.saveEntry({
    id: newId(), date: currentDate, type: "food", meal: $("food-form").meal.value,
    text: f.text, kcal: f.kcal, protein: f.protein, manual: true,
  });
  $("food-dialog").close();
  renderToday();
}

// ============================================================
// ACTIVITY DIALOG
// ============================================================
function openActivityDialog(entry = null) {
  const form = $("activity-form");
  form.reset();
  editingId = entry?.id || null;
  $("activity-dialog-title").textContent = entry ? "Edit exercise" : "Add exercise";

  form.activity.value = entry?.activity || ACTIVITIES[0].id;
  form.minutes.value = entry?.minutes || 30;
  form.intensity.value = entry?.intensity || "moderate";
  form.kcal.dataset.manual = entry?.manual ? "1" : "";
  if (entry) form.kcal.value = entry.kcal;
  updateActivityEstimate(!entry);

  $("activity-dialog").returnValue = "";
  $("activity-dialog").showModal();
}

function updateActivityEstimate(fillField = true) {
  const form = $("activity-form");
  const kcal = calcActivityKcal(form.activity.value, form.intensity.value,
    Number(form.minutes.value) || 0, Store.data.settings.weight);
  $("activity-estimate").textContent = `Estimate: about ${kcal} kcal (based on ${Store.data.settings.weight} kg).`;
  if (fillField && !form.kcal.dataset.manual) form.kcal.value = kcal;
}

function saveActivityFromForm() {
  const form = $("activity-form");
  const old = Store.data.entries.find(e => e.id === editingId);
  Store.saveEntry({
    id: editingId || newId(),
    date: old?.date || currentDate,
    type: "activity",
    activity: form.activity.value,
    minutes: Number(form.minutes.value),
    intensity: form.intensity.value,
    kcal: Math.round(Number(form.kcal.value) || 0),
    manual: !!form.kcal.dataset.manual,
  });
  renderToday();
}

// ============================================================
// WEIGHT DIALOG
// ============================================================
function openWeightDialog() {
  const form = $("weight-form");
  const existing = Store.data.weights.find(w => w.date === currentDate);
  form.kg.value = existing?.kg ?? Store.data.settings.weight;
  $("weight-dialog").returnValue = "";
  $("weight-dialog").showModal();
}

// ============================================================
// HISTORY
// ============================================================
function renderHistory() {
  const s = Store.data.settings;
  const goal = dailyGoal(s);

  // --- calories chart ---
  const labels = [], net = [];
  for (let i = historyRange - 1; i >= 0; i--) {
    const key = addDays(todayKey(), -i);
    const t = dayTotals(key);
    labels.push(historyRange === 7
      ? fromKey(key).toLocaleDateString("en-GB", { weekday: "short" })
      : shortDate(key));
    net.push(t.food.length || t.acts.length ? t.net : null);
  }
  drawKcalChart(labels, net, goal);

  // --- weight chart ---
  const weights = Store.data.weights;
  drawWeightChart(weights, s.goalWeight);
  renderWeightGoal(s, weights);

  renderWeeklyTable();

  $("weight-list").innerHTML = weights.length
    ? weights.slice().reverse().map(w => `<li>
        <span class="grow">${dayLabel(w.date)}</span>
        <span class="kcal">${w.kg} kg</span>
        <button class="mini" data-delete-weight="${w.date}" aria-label="Delete">🗑</button>
      </li>`).join("")
    : '<li class="empty">No weight logged yet.</li>';
}

function renderWeightGoal(s, weights) {
  const text = $("weight-goal-text");
  const notice = $("weight-notice");
  text.textContent = "";
  notice.hidden = true;

  if (s.goalWeight && s.weight > s.goalWeight) {
    const toGo = (s.weight - s.goalWeight).toFixed(1);
    const perWeek = (Number(s.deficit) * 7) / KCAL_PER_KG_FAT;
    let line = `Now ${s.weight} kg · goal ${s.goalWeight} kg · ${toGo} kg to go.`;
    if (perWeek > 0) {
      const weeks = Math.ceil((s.weight - s.goalWeight) / perWeek);
      line += ` At your pace (~${perWeek.toFixed(2)} kg/week) that's roughly ${weeks} weeks.`;
    }
    text.textContent = line;
  } else if (s.goalWeight && s.weight <= s.goalWeight) {
    text.textContent = "You've reached your goal weight 🎉 Consider switching the pace to “Maintain weight”.";
  }

  // Losing faster than ~1 kg/week? (compare weights of the last 3 weeks)
  const since = addDays(todayKey(), -21);
  const recent = weights.filter(w => w.date >= since);
  if (recent.length >= 2) {
    const first = recent[0], last = recent[recent.length - 1];
    const days = (fromKey(last.date) - fromKey(first.date)) / 86400000;
    if (days >= 7) {
      const lossPerWeek = ((first.kg - last.kg) / days) * 7;
      if (lossPerWeek > 1) {
        notice.hidden = false;
        notice.textContent = `You're losing about ${lossPerWeek.toFixed(1)} kg per week. That's faster than recommended and often costs muscle and energy — consider eating a bit more.`;
      }
    }
  }
}

function renderWeeklyTable() {
  // Last 4 weeks, Monday to Sunday, newest first
  const today = fromKey(todayKey());
  const mondayOffset = (today.getDay() + 6) % 7;
  let monday = addDays(todayKey(), -mondayOffset);

  let rows = "";
  for (let w = 0; w < 4; w++) {
    let eaten = 0, netSum = 0, days = 0, workouts = 0, burned = 0;
    for (let d = 0; d < 7; d++) {
      const key = addDays(monday, d);
      if (key > todayKey()) break;
      const t = dayTotals(key);
      workouts += t.acts.length;
      burned += t.burned;
      if (t.food.length) { eaten += t.eaten; netSum += t.net; days++; }
    }
    const label = w === 0 ? "This week" : shortDate(monday);
    rows += `<tr><td>${label}</td>
      <td>${days ? Math.round(eaten / days) : "–"}</td>
      <td>${days ? Math.round(netSum / days) : "–"}</td>
      <td>${workouts}</td>
      <td>${burned}</td></tr>`;
    monday = addDays(monday, -7);
  }
  $("weekly-table").innerHTML = `<table>
    <tr><th>Week</th><th>Ø eaten</th><th>Ø net</th><th>Workouts</th><th>Burned</th></tr>
    ${rows}</table>
    <p class="muted">Ø = average per day (only days with food logged).</p>`;
}

// ============================================================
// SETTINGS
// ============================================================
function renderSettings() {
  const s = Store.data.settings;
  const form = $("settings-form");
  for (const key of ["sex", "age", "height", "weight", "goalWeight", "activity", "deficit", "customGoal"]) {
    form[key].value = s[key] ?? "";
  }
  form.customGoalOn.checked = !!s.customGoalOn;
  $("settings-saved").hidden = true;
  updateSettingsPreview();

  $("fav-list").innerHTML = Store.data.favorites.length
    ? Store.data.favorites.map(f => `<li>
        <span class="grow">${esc(f.text)}</span>
        <span class="kcal">${f.kcal}</span>
        <button class="mini" data-delete-fav="${f.id}" aria-label="Delete">🗑</button>
      </li>`).join("")
    : '<li class="empty">Tick “Save as favourite” when adding food.</li>';
}

function settingsFromForm() {
  const form = $("settings-form");
  return {
    sex: form.sex.value,
    age: Number(form.age.value),
    height: Number(form.height.value),
    weight: Number(form.weight.value),
    goalWeight: form.goalWeight.value ? Number(form.goalWeight.value) : null,
    activity: form.activity.value,
    deficit: form.deficit.value,
    customGoalOn: form.customGoalOn.checked,
    customGoal: form.customGoal.value ? Number(form.customGoal.value) : null,
  };
}

// Live preview of the calculation while typing
function updateSettingsPreview() {
  const s = settingsFromForm();
  $("custom-goal-wrap").hidden = !s.customGoalOn;
  if (!s.age || !s.height || !s.weight) { $("calc-box").innerHTML = ""; return; }

  const goal = dailyGoal(s);
  $("calc-box").innerHTML = `
    <p>Resting need (BMR): <b>${calcBMR(s)} kcal</b></p>
    <p>Daily need without workouts: <b>${calcTDEE(s)} kcal</b></p>
    <p>Suggested goal: <b>${suggestedGoal(s)} kcal</b></p>
    <p>Your daily goal: <b>${goal} kcal</b></p>
    <p class="muted">Logged workouts come on top: if you burn 300 kcal training, you can eat 300 kcal more that day.</p>`;

  const warning = goalWarning(goal, s);
  $("goal-notice").hidden = !warning;
  $("goal-notice").textContent = warning || "";
}

function exportBackup() {
  const blob = new Blob([Store.exportJSON()], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `calorie-tracker-backup-${todayKey()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      if (!confirm("Replace all current data with this backup?")) return;
      Store.importJSON(reader.result);
      alert("Backup imported ✓");
      showView("today");
    } catch (e) {
      alert("That file doesn't look like a backup from this app.");
    }
  };
  reader.readAsText(file);
}

// ============================================================
// Start: connect buttons and show the first view
// ============================================================
function init() {
  Store.load();

  // Tabs
  document.querySelectorAll(".tabbar button").forEach(b =>
    b.addEventListener("click", () => showView(b.dataset.view)));

  // Day navigation
  $("day-prev").onclick = () => { currentDate = addDays(currentDate, -1); renderToday(); };
  $("day-next").onclick = () => { if (currentDate < todayKey()) currentDate = addDays(currentDate, 1); renderToday(); };
  $("day-label").onclick = () => {
    // Tap the date: open a calendar to jump to any past day
    const picker = document.createElement("input");
    picker.type = "date";
    picker.max = todayKey();
    picker.value = currentDate;
    picker.style.cssText = "position:fixed;opacity:0;pointer-events:none;top:0;left:0";
    document.body.appendChild(picker);
    picker.onchange = () => { if (picker.value) currentDate = picker.value; renderToday(); picker.remove(); };
    picker.onblur = () => setTimeout(() => picker.remove(), 500);
    try { picker.showPicker(); } catch (e) { picker.remove(); currentDate = todayKey(); renderToday(); }
  };

  // Today: buttons and list
  $("add-food").onclick = () => openFoodDialog();
  $("add-activity").onclick = () => openActivityDialog();
  $("add-weight").onclick = openWeightDialog;
  $("day-entries").addEventListener("click", onEntryListClick);

  // Food dialog
  const foodForm = $("food-form");
  let typingTimer;
  foodForm.text.addEventListener("input", () => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(updateFoodEstimate, 250);
  });
  foodForm.kcal.addEventListener("input", () => { foodForm.kcal.dataset.manual = "1"; });
  $("fav-chips").addEventListener("click", ev => {
    const id = ev.target.closest("[data-fav]")?.dataset.fav;
    if (id) logFavorite(id);
  });
  $("food-dialog").addEventListener("close", () => {
    if ($("food-dialog").returnValue === "save") saveFoodFromForm();
  });

  // Activity dialog
  $("activity-select").innerHTML = ACTIVITIES.map(a => `<option value="${a.id}">${a.name}</option>`).join("");
  const actForm = $("activity-form");
  for (const el of [actForm.activity, actForm.minutes, ...actForm.intensity]) {
    el.addEventListener("input", () => updateActivityEstimate());
    el.addEventListener("change", () => updateActivityEstimate());
  }
  actForm.kcal.addEventListener("input", () => { actForm.kcal.dataset.manual = "1"; });
  $("activity-dialog").addEventListener("close", () => {
    if ($("activity-dialog").returnValue === "save") saveActivityFromForm();
  });

  // Weight dialog
  $("weight-dialog").addEventListener("close", () => {
    if ($("weight-dialog").returnValue !== "save") return;
    Store.saveWeight(currentDate, Number($("weight-form").kg.value));
    renderToday();
  });

  // History
  $("range-toggle").addEventListener("click", ev => {
    const btn = ev.target.closest("[data-range]");
    if (!btn) return;
    historyRange = Number(btn.dataset.range);
    document.querySelectorAll("#range-toggle button").forEach(b => b.classList.toggle("active", b === btn));
    renderHistory();
  });
  $("weight-list").addEventListener("click", ev => {
    const date = ev.target.closest("[data-delete-weight]")?.dataset.deleteWeight;
    if (date && confirm("Delete this weight entry?")) { Store.deleteWeight(date); renderHistory(); }
  });

  // Settings
  const settingsForm = $("settings-form");
  settingsForm.addEventListener("input", updateSettingsPreview);
  settingsForm.addEventListener("submit", ev => {
    ev.preventDefault();
    Store.saveSettings({ ...settingsFromForm(), setupDone: true });
    $("welcome").hidden = true;
    $("settings-saved").hidden = false;
    setTimeout(() => showView("today"), 700);
  });
  $("fav-list").addEventListener("click", ev => {
    const id = ev.target.closest("[data-delete-fav]")?.dataset.deleteFav;
    if (id) { Store.deleteFavorite(id); renderSettings(); }
  });
  $("export-btn").onclick = exportBackup;
  $("import-btn").onclick = () => $("import-file").click();
  $("import-file").onchange = ev => { if (ev.target.files[0]) importBackup(ev.target.files[0]); ev.target.value = ""; };
  $("reset-btn").onclick = () => {
    if (confirm("Really delete ALL entries, weights and settings? This cannot be undone.")) {
      Store.reset();
      showView("settings");
    }
  };

  // First visit: ask for body data first
  if (!Store.data.settings.setupDone) {
    showView("settings");
    $("welcome").hidden = false;
  } else {
    showView("today");
  }
}

init();
