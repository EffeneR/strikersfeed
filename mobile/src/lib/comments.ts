import { supabase } from "./supabase";

export interface CommentView {
  id: string;
  body: string;
  createdAt: string;
  isOwn: boolean;
  author: {
    id: string;
    displayName: string;
    handle: string;
    avatarUrl: string | null;
  };
}

const MAX = 500;

export async function getComments(postId: string): Promise<CommentView[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("comments")
    .select("id, body, created_at, author_id, profiles ( id, username, display_name, avatar_url )")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .limit(200);
  if (!data) return [];

  return (data as unknown as Record<string, unknown>[]).map((row) => {
    const p = (Array.isArray(row.profiles) ? row.profiles[0] : row.profiles) as
      | { id: string; username: string | null; display_name: string | null; avatar_url: string | null }
      | null;
    return {
      id: row.id as string,
      body: (row.body as string) ?? "",
      createdAt: row.created_at as string,
      isOwn: !!user && row.author_id === user.id,
      author: {
        id: p?.id ?? (row.author_id as string),
        displayName: p?.display_name ?? p?.username ?? "Member",
        handle: p?.username ?? "member",
        avatarUrl: p?.avatar_url ?? null,
      },
    };
  });
}

export async function addComment(postId: string, body: string): Promise<{ error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to reply." };
  const trimmed = body.trim();
  if (!trimmed) return { error: "Write a reply first." };
  if (trimmed.length > MAX) return { error: `Replies are limited to ${MAX} characters.` };

  const { error } = await supabase
    .from("comments")
    .insert({ post_id: postId, author_id: user.id, body: trimmed });
  return { error: error?.message };
}

export async function deleteComment(id: string): Promise<{ error?: string }> {
  const { error } = await supabase.from("comments").delete().eq("id", id);
  return { error: error?.message };
}
