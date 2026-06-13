/**
 * Supabase Module
 * Burger & Broaster Express
 *
 * Initializes and exports the Supabase client
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY.");
    return null;
  }

  if (window.supabase) {
    return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  console.error("Supabase SDK not loaded yet.");
  return null;
}

export { SUPABASE_URL };
