import { supabase } from "./supabase";

/**
 * Activity feed = replies other people left on your posts. (Reaction rows are
 * RLS-restricted to their own owner, so "who liked your post" isn't queryable
 * by the recipient — replies are the honest, readable signal.)
 */
export interface ActivityItem {
  id: string;
  createdAt: string;
  postId: string;
  snippet: string;
  actor: {
    id: string;
    displayName: string;
    handle: string;
    avatarUrl: string | null;
  };
}

export async function getActivity(limit = 40): Promise<ActivityItem[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("comments")
    .select(
      "id, body, created_at, author_id, post_id, profiles ( id, username, display_name, avatar_url ), posts!inner ( author_id )",
    )
    .eq("posts.author_id", user.id)
    .neq("author_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (!data) return [];

  return (data as unknown as Record<string, unknown>[]).map((row) => {
    const p = (Array.isArray(row.profiles) ? row.profiles[0] : row.profiles) as
      | { id: string; username: string | null; display_name: string | null; avatar_url: string | null }
      | null;
    return {
      id: row.id as string,
      createdAt: row.created_at as string,
      postId: row.post_id as string,
      snippet: (row.body as string) ?? "",
      actor: {
        id: p?.id ?? (row.author_id as string),
        displayName: p?.display_name ?? p?.username ?? "Member",
        handle: p?.username ?? "member",
        avatarUrl: p?.avatar_url ?? null,
      },
    };
  });
}
