"use server";

import type { AuthorView } from "@/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const MAX_BODY = 500;

export interface CommentView {
  id: string;
  body: string;
  createdAt: string;
  author: AuthorView;
  isOwn: boolean;
}

interface CommentProfile {
  id: string | null;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: string | null;
}

function toAuthor(profile: CommentProfile | null, authorId: string): AuthorView {
  const handle = profile?.username ?? "member";
  return {
    id: profile?.id ?? authorId,
    displayName: profile?.display_name ?? profile?.username ?? "Member",
    handle,
    avatarUrl: profile?.avatar_url ?? "",
    isVerified: false,
    type: profile?.role === "team" ? "team" : "player",
    profileHref: `/players/${handle}`,
  };
}

export async function getPostComments(postId: string): Promise<CommentView[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("comments")
    .select(
      "id, body, created_at, author_id, profiles ( id, username, display_name, avatar_url, role )",
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .limit(100);
  if (!data) return [];

  return (data as unknown as Record<string, unknown>[]).map((row) => {
    const profile = (Array.isArray(row.profiles) ? row.profiles[0] : row.profiles) as
      | CommentProfile
      | null;
    return {
      id: row.id as string,
      body: (row.body as string) ?? "",
      createdAt: row.created_at as string,
      author: toAuthor(profile, row.author_id as string),
      isOwn: !!user && row.author_id === user.id,
    };
  });
}

export async function addComment(input: {
  postId: string;
  body: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "demo" };
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "demo" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in to reply." };

  const body = input.body.trim();
  if (body.length === 0) return { ok: false, error: "Write a reply first." };
  if (body.length > MAX_BODY) {
    return { ok: false, error: `Replies are limited to ${MAX_BODY} characters.` };
  }

  const { error } = await supabase
    .from("comments")
    .insert({ post_id: input.postId, author_id: user.id, body });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteComment(input: {
  id: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "demo" };
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "demo" };

  const { error } = await supabase.from("comments").delete().eq("id", input.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
