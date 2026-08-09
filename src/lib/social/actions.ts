"use server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export interface FollowResult {
  ok: boolean;
  /** Whether the viewer follows the target after the toggle. */
  following?: boolean;
  error?: string;
}

/**
 * Toggle the signed-in user's follow of `targetId`. Idempotent (insert if absent,
 * delete if present). Denormalised counts are maintained by the DB trigger
 * (migration 0012); RLS ensures a user only manages their own follows.
 */
export async function toggleFollow(targetId: string): Promise<FollowResult> {
  if (!isSupabaseConfigured()) return { ok: false, error: "demo" };
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "demo" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in to follow." };
  if (user.id === targetId) return { ok: false, error: "You can't follow yourself." };

  const { data: existing } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("followee_id", targetId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("follows").delete().eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, following: false };
  }

  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: user.id, followee_id: targetId });
  if (error) return { ok: false, error: error.message };
  return { ok: true, following: true };
}
