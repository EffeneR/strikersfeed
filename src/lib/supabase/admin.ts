import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

/**
 * Service-role Supabase client — SERVER ONLY. Bypasses RLS, so it must never be
 * imported into client components. Used by the Steam login bridge + verification
 * to write protected identity/verification columns and manage auth users.
 */
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export function isAdminConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SERVICE_ROLE_KEY.length > 0;
}

export function createAdminClient(): SupabaseClient | null {
  if (!isAdminConfigured()) return null;
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
