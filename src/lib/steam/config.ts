import { isAdminConfigured } from "@/lib/supabase/admin";

/** Steam Web API key — SERVER ONLY (never NEXT_PUBLIC). */
export const STEAM_WEB_API_KEY = process.env.STEAM_WEB_API_KEY ?? "";

/** Non-deliverable email domain for Steam-first accounts. */
export const STEAM_EMAIL_DOMAIN = "steam.strikersfeed.club";

/** Verification codes expire after this long. */
export const VERIFICATION_TTL_MS = 30 * 60 * 1000;

/**
 * Server-side readiness: needs the Steam Web API key AND the service-role client
 * (to bridge sessions / write verification). Independent of the public
 * STEAM_ENABLED UI flag.
 */
export function isSteamServerConfigured(): boolean {
  return STEAM_WEB_API_KEY.length > 0 && isAdminConfigured();
}
