import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export interface BlockedProfile {
  id: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  blockedAt: string;
}

/**
 * The set of account ids the given user has blocked. Used by the feed to drop
 * blocked authors' posts. Never throws — returns an empty set on any error.
 */
export async function getBlockedUserIds(
  supabase: SupabaseClient,
  userId: string,
): Promise<Set<string>> {
  try {
    const { data } = await supabase
      .from("blocked_users")
      .select("blocked_id")
      .eq("blocker_id", userId);
    return new Set((data ?? []).map((r) => (r as { blocked_id: string }).blocked_id));
  } catch {
    return new Set();
  }
}

/** The current user's blocked accounts, with profile details, for settings. */
export async function getBlockedProfiles(): Promise<BlockedProfile[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
      .from("blocked_users")
      .select(
        "created_at, blocked_id, profiles:blocked_id ( id, username, display_name, avatar_url )",
      )
      .eq("blocker_id", user.id)
      .order("created_at", { ascending: false });

    if (!data) return [];

    return (data as unknown as Record<string, unknown>[]).map((row) => {
      const p = (Array.isArray(row.profiles) ? row.profiles[0] : row.profiles) as
        | { id: string; username: string | null; display_name: string | null; avatar_url: string | null }
        | null;
      return {
        id: (p?.id ?? row.blocked_id) as string,
        username: p?.username ?? null,
        displayName: p?.display_name ?? null,
        avatarUrl: p?.avatar_url ?? null,
        blockedAt: row.created_at as string,
      };
    });
  } catch {
    return [];
  }
}
