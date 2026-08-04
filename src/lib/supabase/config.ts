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

/** Public canonical site origin (used for OAuth/OpenID return URLs). */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

/**
 * Public flag: whether "Sign in with Steam" is offered in the UI. The server
 * still independently checks its own STEAM_WEB_API_KEY before doing anything —
 * this only controls whether the button is shown.
 */
export const STEAM_ENABLED = process.env.NEXT_PUBLIC_STEAM_ENABLED === "true";
