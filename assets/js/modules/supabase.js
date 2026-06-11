/**
 * Supabase Module
 * Burger & Broaster Express
 * 
 * Initializes and exports the Supabase client
 */

const SUPABASE_URL = 'https://pqcrhfnwshrlyndhsvas.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxY3JoZm53c2hybHluZGhzdmFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMjY4MTEsImV4cCI6MjA5NjcwMjgxMX0.dfsnC1LSdBxSUNDCFuZ0MMNTLZHq0jp-Jx7wFPol-bo';

// Wait for supabase global to be available from CDN
export function getSupabase() {
    if (window.supabase) {
        return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    console.error('Supabase SDK not loaded yet.');
    return null;
}

export { SUPABASE_URL };
