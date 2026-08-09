import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/** The set of account ids the given user follows. Never throws. */
export async function getFollowingIds(
  supabase: SupabaseClient,
  userId: string,
): Promise<Set<string>> {
  try {
    const { data } = await supabase
      .from("follows")
      .select("followee_id")
      .eq("follower_id", userId);
    return new Set((data ?? []).map((r) => (r as { followee_id: string }).followee_id));
  } catch {
    return new Set();
  }
}

/**
 * Which of `targetIds` the signed-in viewer follows — for rendering initial
 * Follow-button state on the server. Returns {} when signed out / demo.
 */
export async function getFollowState(targetIds: string[]): Promise<Record<string, boolean>> {
  if (!isSupabaseConfigured() || targetIds.length === 0) return {};
  try {
    const supabase = await createClient();
    if (!supabase) return {};
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return {};

    const { data } = await supabase
      .from("follows")
      .select("followee_id")
      .eq("follower_id", user.id)
      .in("followee_id", targetIds);

    const map: Record<string, boolean> = {};
    for (const id of targetIds) map[id] = false;
    for (const r of data ?? []) map[(r as { followee_id: string }).followee_id] = true;
    return map;
  } catch {
    return {};
  }
}

export interface FollowCounts {
  followers: number;
  following: number;
}

/** Follower / following counts for a profile (from the denormalised columns). */
export async function getFollowCounts(userId: string): Promise<FollowCounts> {
  if (!isSupabaseConfigured()) return { followers: 0, following: 0 };
  try {
    const supabase = await createClient();
    if (!supabase) return { followers: 0, following: 0 };
    const { data } = await supabase
      .from("profiles")
      .select("follower_count, following_count")
      .eq("id", userId)
      .maybeSingle();
    return {
      followers: (data?.follower_count as number) ?? 0,
      following: (data?.following_count as number) ?? 0,
    };
  } catch {
    return { followers: 0, following: 0 };
  }
}
