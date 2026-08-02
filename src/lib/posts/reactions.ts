"use server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type ReactionKind = "like" | "repost" | "bookmark";

export interface ReactionResult {
  ok: boolean;
  /** Whether the reaction is active after the toggle. */
  active?: boolean;
  error?: string;
}

/**
 * Toggle the signed-in user's reaction on a post. Idempotent: inserts the row
 * if absent, deletes it if present. Denormalised counts are maintained by the
 * DB trigger (see migration 0006). RLS ensures a user only touches their own
 * reactions.
 */
export async function toggleReaction(input: {
  postId: string;
  kind: ReactionKind;
}): Promise<ReactionResult> {
  if (!isSupabaseConfigured()) return { ok: false, error: "demo" };
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "demo" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in to react." };

  const { data: existing } = await supabase
    .from("post_reactions")
    .select("id")
    .eq("post_id", input.postId)
    .eq("user_id", user.id)
    .eq("kind", input.kind)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("post_reactions").delete().eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, active: false };
  }

  const { error } = await supabase
    .from("post_reactions")
    .insert({ post_id: input.postId, user_id: user.id, kind: input.kind });
  if (error) return { ok: false, error: error.message };
  return { ok: true, active: true };
}
