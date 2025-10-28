import { SUPABASE_URL, SUPABASE_KEY } from '../utils/constants.js';

// Use supabase-js from CDN (global supabase will be available)
// Fallback to ESM createClient if provided
const createClient = window.supabase?.createClient || window.createClient;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    flowType: 'pkce',
    storage: localStorage, // Note: for static hosting; use server-side cookies in production
  }
});

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data?.session || null;
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => callback(session));
}
