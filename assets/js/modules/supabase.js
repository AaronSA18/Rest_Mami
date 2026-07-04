/**
 * Supabase Module - Optimized
 * Burger & Broaster Express
 *
 * Initializes and exports the Supabase client
 * Performance: Reduced console errors, cached client instance
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let cachedClient = null;

export function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    if (import.meta.env.DEV) {
      console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.");
    }
    return null;
  }

  // Return cached client if available
  if (cachedClient) return cachedClient;

  if (window.supabase) {
    cachedClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return cachedClient;
  }

  if (import.meta.env.DEV) {
    console.error("Supabase SDK not loaded yet.");
  }
  return null;
}

export { SUPABASE_URL };
