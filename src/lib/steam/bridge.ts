import { createAdminClient } from "@/lib/supabase/admin";
import { STEAM_EMAIL_DOMAIN } from "./config";
import { getPlayerSummary } from "./api";

export interface BridgeResult {
  ok: boolean;
  email?: string;
  error?: string;
}

/**
 * Find-or-create the Supabase user for a verified SteamID64, link + mark the
 * profile `steam_verified`, and return the user's email (for session minting).
 * Uses the service-role client (bypasses RLS + protected columns). SERVER ONLY.
 */
export async function ensureSteamUser(steamId64: string): Promise<BridgeResult> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Server not configured." };

  const summary = await getPlayerSummary(steamId64);

  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("steam_id", steamId64)
    .maybeSingle();

  let userId: string;
  let email: string | undefined;

  if (existing?.id) {
    userId = existing.id as string;
    const { data: got } = await admin.auth.admin.getUserById(userId);
    email = got?.user?.email ?? undefined;
  } else {
    email = `steam-${steamId64}@${STEAM_EMAIL_DOMAIN}`;
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        display_name: summary?.personaname ?? `Player ${steamId64.slice(-4)}`,
        role: "player",
        steam_id: steamId64,
      },
    });
    if (error || !created?.user) {
      return { ok: false, error: error?.message ?? "Couldn't create the account." };
    }
    userId = created.user.id;
  }

  await admin
    .from("profiles")
    .update({
      steam_id: steamId64,
      steam_persona: summary?.personaname ?? null,
      steam_avatar_url: summary?.avatarfull ?? null,
      verification_status: "steam_verified",
      verified_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (!email) return { ok: false, error: "Account has no email." };
  return { ok: true, email };
}
