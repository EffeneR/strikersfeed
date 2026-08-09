"use server";

import { createClient } from "@/lib/supabase/server";
import {
  confirmSteamVerificationFor,
  startSteamVerificationFor,
  unlinkSteamFor,
  type ConfirmResult,
  type StartResult,
} from "./verify";

/** Cookie-authenticated wrappers (web). Mobile uses the bearer-token API routes. */

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
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Please sign in first." };
  return startSteamVerificationFor(userId, input.steamInput);
}

export async function confirmSteamVerification(): Promise<ConfirmResult> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Please sign in first." };
  return confirmSteamVerificationFor(userId);
}

export async function unlinkSteam(): Promise<{ ok: boolean; error?: string }> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Please sign in first." };
  return unlinkSteamFor(userId);
}
