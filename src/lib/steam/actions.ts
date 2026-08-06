"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSteamServerConfigured, VERIFICATION_TTL_MS } from "./config";
import { parseSteamInput } from "./parse";
import { getPlayerSummary, resolveVanity } from "./api";

export interface StartResult {
  ok: boolean;
  code?: string;
  steamId?: string;
  persona?: string;
  error?: string;
}

export interface ConfirmResult {
  ok: boolean;
  persona?: string;
  error?: string;
}

function makeCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return `SFEED-${out}`;
}

async function currentUserId(): Promise<string | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function startSteamVerification(input: {
  steamInput: string;
}): Promise<StartResult> {
  if (!isSteamServerConfigured()) return { ok: false, error: "Steam isn't configured yet." };
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Steam isn't configured yet." };
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Please sign in first." };

  const ref = parseSteamInput(input.steamInput);
  if (!ref) return { ok: false, error: "Enter a valid Steam profile URL, ID or handle." };
  const steamId = ref.steamId64 ?? (ref.vanity ? await resolveVanity(ref.vanity) : null);
  if (!steamId) return { ok: false, error: "Couldn't find that Steam profile." };

  // Reject a Steam account already linked to a different StrikersFeed user.
  const { data: taken } = await admin
    .from("profiles")
    .select("id")
    .eq("steam_id", steamId)
    .neq("id", userId)
    .maybeSingle();
  if (taken) {
    return { ok: false, error: "That Steam account is already linked to another user." };
  }

  const summary = await getPlayerSummary(steamId);
  const code = makeCode();
  const { error } = await admin.from("steam_verifications").insert({
    user_id: userId,
    steam_id: steamId,
    persona: summary?.personaname ?? null,
    avatar_url: summary?.avatarfull ?? null,
    code,
    method: "profile_code",
    expires_at: new Date(Date.now() + VERIFICATION_TTL_MS).toISOString(),
  });
  if (error) return { ok: false, error: error.message };

  return { ok: true, code, steamId, persona: summary?.personaname };
}

export async function confirmSteamVerification(): Promise<ConfirmResult> {
  if (!isSteamServerConfigured()) return { ok: false, error: "Steam isn't configured yet." };
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Steam isn't configured yet." };
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Please sign in first." };

  const { data: challenge } = await admin
    .from("steam_verifications")
    .select("id, steam_id, code, persona, avatar_url")
    .eq("user_id", userId)
    .is("consumed_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!challenge) {
    return { ok: false, error: "No active verification — start one first." };
  }

  const summary = await getPlayerSummary(challenge.steam_id as string);
  const realname = (summary?.realname ?? "").toUpperCase();
  if (!summary || !realname.includes((challenge.code as string).toUpperCase())) {
    return {
      ok: false,
      error:
        "Code not found in your Steam profile's Real Name yet. Add it (Edit Profile → Real Name), save, then try again.",
    };
  }

  // Link + verify (service role bypasses the protected columns).
  const { error: updErr } = await admin
    .from("profiles")
    .update({
      steam_id: challenge.steam_id,
      steam_persona: summary.personaname,
      steam_avatar_url: summary.avatarfull ?? challenge.avatar_url ?? null,
      verification_status: "steam_verified",
      verified_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (updErr) return { ok: false, error: updErr.message };

  await admin
    .from("steam_verifications")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", challenge.id);

  return { ok: true, persona: summary.personaname };
}

export async function unlinkSteam(): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Steam isn't configured yet." };
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Please sign in first." };

  const { error } = await admin
    .from("profiles")
    .update({
      steam_id: null,
      steam_persona: null,
      steam_avatar_url: null,
      verification_status: "none",
      verified_at: null,
    })
    .eq("id", userId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
