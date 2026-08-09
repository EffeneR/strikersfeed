import { supabase } from "./supabase";

/** Follows — reads/writes the same `follows` table as the website (migration 0012). */

export async function isFollowing(targetId: string): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("followee_id", targetId)
    .maybeSingle();
  return !!data;
}

export async function toggleFollow(
  targetId: string,
): Promise<{ following: boolean; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { following: false, error: "Please sign in." };
  if (user.id === targetId) return { following: false, error: "You can't follow yourself." };

  const { data: existing } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("followee_id", targetId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("follows").delete().eq("id", existing.id);
    return { following: !!error, error: error?.message };
  }
  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: user.id, followee_id: targetId });
  return { following: !error, error: error?.message };
}

export async function getFollowCounts(
  userId: string,
): Promise<{ followers: number; following: number }> {
  const { data } = await supabase
    .from("profiles")
    .select("follower_count, following_count")
    .eq("id", userId)
    .maybeSingle();
  return {
    followers: (data?.follower_count as number) ?? 0,
    following: (data?.following_count as number) ?? 0,
  };
}

/** Ids the signed-in user follows — for filtering the feed to a Following view. */
export async function getFollowingIds(): Promise<Set<string>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data } = await supabase.from("follows").select("followee_id").eq("follower_id", user.id);
  return new Set((data ?? []).map((r) => (r as { followee_id: string }).followee_id));
}
