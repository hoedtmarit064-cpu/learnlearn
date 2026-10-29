// ------------------------------------------------------------
// Sync between devices (Supabase)
//
// - You log in with email + password.
// - Every change is uploaded a moment later (one row per record).
// - Changes from your other devices are downloaded when the app
//   opens, when you come back to it, and every 2 minutes.
// - If the same record was changed on two devices, the newer one wins.
// - Without internet the app keeps working; it syncs when you're back online.
//
// The database table and its security rules are in supabase/setup.sql.
// ------------------------------------------------------------

const PAGE_SIZE = 1000;

const Sync = {
  client: null,
  user: null,
  status: "off",       // off | syncing | ok | error | unavailable
  message: "",
  lastSync: null,
  busy: false,
  again: false,
  pushTimer: null,
  onRemoteChange: null,   // set by app.js: re-draw the screen

  init() {
    if (typeof supabase === "undefined" || !SUPABASE_URL || !SUPABASE_KEY) {
      this.status = "unavailable";
      this.renderUI();
      return;
    }
    this.client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    Store.onLocalChange = () => this.schedulePush();

    this.client.auth.onAuthStateChange((event, session) => {
      const user = session?.user || null;
      const newUser = user?.id !== this.user?.id;
      this.user = user;
      if (!user) this.status = "off";
      this.renderUI();
      // (Supabase asks us not to call it directly inside this callback)
      if (user && newUser) setTimeout(() => this.syncNow(), 0);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") this.syncNow();
    });
    window.addEventListener("online", () => this.syncNow());
    setInterval(() => {
      if (document.visibilityState === "visible") this.syncNow();
    }, 2 * 60 * 1000);
  },

  schedulePush() {
    if (!this.user) return;
    clearTimeout(this.pushTimer);
    this.pushTimer = setTimeout(() => this.syncNow(), 1500);
  },

  async syncNow() {
    if (!this.user) return;
    if (this.busy) { this.again = true; return; }
    this.busy = true;
    this.status = "syncing";
    this.renderUI();
    try {
      const meta = Store.data.sync;
      const firstTime = meta.userId !== this.user.id;
      if (firstTime) {
        meta.userId = this.user.id;
        meta.lastPulled = null;
      }
      const serverTimes = await this.pull();
      if (firstTime) Store.markLocalNewerThan(serverTimes);
      await this.push();
      this.status = "ok";
      this.message = "";
      this.lastSync = new Date();
    } catch (e) {
      console.error("Sync failed", e);
      this.status = "error";
      this.message = navigator.onLine ? (e.message || String(e)) : "You're offline – will sync later.";
    } finally {
      this.busy = false;
      this.renderUI();
    }
    if (this.again) { this.again = false; this.syncNow(); }
  },

  // Download everything that changed since last time
  async pull() {
    const meta = Store.data.sync;
    const serverTimes = {};
    let changed = false;
    let newest = meta.lastPulled;

    for (let from = 0; ; from += PAGE_SIZE) {
      let query = this.client.from("items")
        .select("id, kind, data, deleted, updated_at, server_updated_at");
      if (meta.lastPulled) query = query.gte("server_updated_at", meta.lastPulled);
      const { data: rows, error } = await query
        .order("server_updated_at", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw error;

      for (const row of rows) {
        serverTimes[row.id] = Date.parse(row.updated_at);
        if (Store.applyRemote(row)) changed = true;
        newest = row.server_updated_at;
      }
      if (rows.length < PAGE_SIZE) break;
    }

    meta.lastPulled = newest;
    Store.save();
    if (changed && this.onRemoteChange) this.onRemoteChange();
    return serverTimes;
  },

  // Upload everything that changed here
  async push() {
    const dirty = Store.data.sync.dirty;
    const ids = Object.keys(dirty);
    if (!ids.length) return;

    const rows = ids.map(id => {
      const d = dirty[id];
      const data = d.deleted ? null : Store.recordData(d.kind, id);
      return {
        user_id: this.user.id,
        id,
        kind: d.kind,
        data,
        deleted: d.deleted || data === null,
        updated_at: new Date(d.updatedAt).toISOString(),
      };
    });

    for (let i = 0; i < rows.length; i += 500) {
      const chunk = rows.slice(i, i + 500);
      const { error } = await this.client.from("items").upsert(chunk, { onConflict: "user_id,id" });
      if (error) throw error;
      // done – unless the record was changed again meanwhile
      for (const row of chunk) {
        if (dirty[row.id] && new Date(dirty[row.id].updatedAt).toISOString() === row.updated_at) {
          delete dirty[row.id];
        }
      }
      Store.save();
    }
  },

  // ----- account -----
  async signUp(email, password) {
    const { data, error } = await this.client.auth.signUp({
      email, password,
      options: { emailRedirectTo: location.href.split("#")[0] },
    });
    if (error) throw error;
    return data.session
      ? "Account created – you're logged in."
      : "Almost done: check your email and tap the confirmation link, then log in here.";
  },

  async logIn(email, password) {
    const { error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  async logOut() {
    await this.syncNow();            // upload the last changes first
    await this.client.auth.signOut();
    Store.data.sync = { userId: null, lastPulled: null, dirty: {} };
    Store.save();
    this.renderUI();
  },

  // ----- display -----
  renderUI() {
    const badge = document.getElementById("sync-status");
    const card = document.getElementById("sync-card");
    if (!badge || !card) return;

    const labels = {
      off: "", unavailable: "", syncing: "☁︎ syncing…", ok: "☁︎ synced", error: "☁︎ not synced",
    };
    badge.textContent = labels[this.status] || "";
    badge.className = "sync-badge " + this.status;

    if (this.status === "unavailable") {
      card.innerHTML = `<h2>Sync</h2><p class="muted">Sync isn't available right now (no internet, or not set up yet). Your data is safe on this device.</p>`;
      return;
    }

    if (!this.user) {
      card.innerHTML = `
        <h2>Sync phone & laptop</h2>
        <p class="muted">Log in on every device with the same account to see the same data everywhere.</p>
        <form id="auth-form">
          <label>Email <input name="email" type="email" autocomplete="email" required></label>
          <label>Password <input name="password" type="password" minlength="6" autocomplete="current-password" required></label>
          <div class="actions">
            <button class="btn primary" value="login">Log in</button>
            <button class="btn" value="signup">Create account</button>
          </div>
          <p class="muted" id="auth-message"></p>
        </form>`;
      const form = document.getElementById("auth-form");
      form.addEventListener("submit", async ev => {
        ev.preventDefault();
        const msg = document.getElementById("auth-message");
        const action = ev.submitter?.value || "login";
        msg.textContent = "One moment…";
        try {
          if (action === "signup") msg.textContent = await this.signUp(form.email.value, form.password.value);
          else await this.logIn(form.email.value, form.password.value);
        } catch (e) {
          msg.textContent = friendlyAuthError(e);
        }
      });
      return;
    }

    const when = this.lastSync
      ? this.lastSync.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
      : "–";
    const state = {
      syncing: "Syncing…",
      ok: `Synced ✓ (last: ${when})`,
      error: `Not synced: ${esc(this.message)}`,
    }[this.status] || "";
    card.innerHTML = `
      <h2>Sync phone & laptop</h2>
      <p>Logged in as <b>${esc(this.user.email)}</b></p>
      <p class="muted">${state}</p>
      <div class="actions">
        <button class="btn" id="sync-now">Sync now</button>
        <button class="btn" id="log-out">Log out</button>
      </div>`;
    document.getElementById("sync-now").onclick = () => this.syncNow();
    document.getElementById("log-out").onclick = () => this.logOut();
  },
};

function friendlyAuthError(e) {
  const m = (e.message || "").toLowerCase();
  if (m.includes("invalid login")) return "Email or password is wrong.";
  if (m.includes("not confirmed")) return "Please confirm your email first (check your inbox).";
  if (m.includes("already registered")) return "This email already has an account – just log in.";
  if (m.includes("password")) return e.message;
  return "That didn't work: " + (e.message || e);
}
