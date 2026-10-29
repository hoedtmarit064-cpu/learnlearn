// ------------------------------------------------------------
// Supabase connection (for sync between devices)
//
// These two values are meant to be public – they are visible in every
// browser that opens the app. Your data is protected by your login and
// the security rules in supabase/setup.sql, not by these values.
//
// NEVER put the "service_role" / "secret" key here.
// ------------------------------------------------------------

const SUPABASE_URL = "https://oezdvwujwkhgrlfvioxm.supabase.co";
const SUPABASE_KEY = "";   // Supabase → Project Settings → API Keys → "Publishable key" (or "anon public")
