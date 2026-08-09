import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type NotificationType = "reply" | "reaction" | "follow";

export interface NotificationView {
  id: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  actor: {
    id: string;
    displayName: string;
    handle: string;
    avatarUrl: string | null;
  } | null;
  /** Reply body snippet, when type === "reply". */
  snippet?: string;
}

const SELECT =
  "id, type, read_at, created_at, actor_id, " +
  "actor:profiles!actor_id ( id, username, display_name, avatar_url ), " +
  "comment:comments!comment_id ( body )";

interface ActorRow {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

function mapRow(row: Record<string, unknown>): NotificationView {
  const a = (Array.isArray(row.actor) ? row.actor[0] : row.actor) as ActorRow | null;
  const comment = (Array.isArray(row.comment) ? row.comment[0] : row.comment) as
    | { body: string | null }
    | null;
  return {
    id: row.id as string,
    type: row.type as NotificationType,
    read: !!row.read_at,
    createdAt: row.created_at as string,
    actor: a
      ? {
          id: a.id,
          displayName: a.display_name ?? a.username ?? "Someone",
          handle: a.username ?? "member",
          avatarUrl: a.avatar_url ?? null,
        }
      : null,
    snippet: comment?.body ?? undefined,
  };
}

/** The signed-in user's notifications (newest first). Empty when signed out/demo. */
export async function getNotifications(limit = 40): Promise<NotificationView[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    if (!supabase) return [];
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("notifications")
      .select(SELECT)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return (data as unknown as Record<string, unknown>[]).map(mapRow);
  } catch {
    return [];
  }
}

/** Count of unread notifications, for a nav badge. */
export async function getUnreadCount(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  try {
    const supabase = await createClient();
    if (!supabase) return 0;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null);
    return count ?? 0;
  } catch {
    return 0;
  }
}
