import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

/**
 * Browser Supabase client for use inside Client Components.
 * Returns `null` when Supabase isn't configured so callers can fall back to the
 * demo behaviour instead of crashing.
 */
export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
