/**
 * Supabase configuration + a guard used everywhere to decide whether the app
 * runs against a real Supabase project or falls back to the Phase 1 demo/mock
 * behaviour. Because these are NEXT_PUBLIC vars they are inlined at build time
 * and readable on both the server and the client.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True only when both the URL and anon key are present. */
export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}
