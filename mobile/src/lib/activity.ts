import { supabase } from "./supabase";

/**
 * Notifications = the shared `notifications` table (migration 0013): replies,
 * likes, and follows targeting you, written by DB triggers.
 */
export type NotificationType = "reply" | "reaction" | "follow";

export interface ActivityItem {
  id: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  postId: string | null;
  snippet?: string;
  actor: {
    id: string;
    displayName: string;
    handle: string;
    avatarUrl: string | null;
  } | null;
}

const SELECT =
  "id, type, read_at, created_at, post_id, actor_id, " +
  "actor:profiles!actor_id ( id, username, display_name, avatar_url ), " +
  "comment:comments!comment_id ( body )";

export async function getActivity(limit = 40): Promise<ActivityItem[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("notifications")
    .select(SELECT)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  return ((data ?? []) as unknown as Record<string, unknown>[]).map((row) => {
    const a = (Array.isArray(row.actor) ? row.actor[0] : row.actor) as
      | { id: string; username: string | null; display_name: string | null; avatar_url: string | null }
      | null;
    const c = (Array.isArray(row.comment) ? row.comment[0] : row.comment) as
      | { body: string | null }
      | null;
    return {
      id: row.id as string,
      type: row.type as NotificationType,
      read: !!row.read_at,
      createdAt: row.created_at as string,
      postId: (row.post_id as string) ?? null,
      snippet: c?.body ?? undefined,
      actor: a
        ? {
            id: a.id,
            displayName: a.display_name ?? a.username ?? "Someone",
            handle: a.username ?? "member",
            avatarUrl: a.avatar_url ?? null,
          }
        : null,
    };
  });
}

/** Mark all of the signed-in user's notifications read. */
export async function markAllActivityRead(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);
}
