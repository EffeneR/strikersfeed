import { supabase } from "./supabase";

/**
 * Mobile reads the SAME `posts` backend as the website — no mobile-only model.
 * Keep the shape small and provider-agnostic for the feed list.
 */
export interface FeedAuthor {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  steamVerified: boolean;
}

export interface FeedPost {
  id: string;
  body: string;
  createdAt: string;
  type: string;
  imageUrls: string[];
  likeCount: number;
  repostCount: number;
  commentCount: number;
  author: FeedAuthor;
}

const SITE = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const publicImage = (path: string) =>
  `${SITE}/storage/v1/object/public/post-images/${path}`;

const SELECT =
  "id, body, type, created_at, like_count, repost_count, comment_count, " +
  "profiles ( id, username, display_name, avatar_url, verification_status ), " +
  "post_media ( storage_path, position )";

interface RawRow {
  id: string;
  body: string | null;
  type: string;
  created_at: string;
  like_count: number | null;
  repost_count: number | null;
  comment_count: number | null;
  profiles:
    | {
        id: string;
        username: string | null;
        display_name: string | null;
        avatar_url: string | null;
        verification_status: string | null;
      }
    | null;
  post_media: { storage_path: string | null; position: number | null }[] | null;
}

function mapRow(row: RawRow): FeedPost {
  const p = row.profiles;
  return {
    id: row.id,
    body: row.body ?? "",
    createdAt: row.created_at,
    type: row.type,
    imageUrls: (row.post_media ?? [])
      .filter((m) => m.storage_path)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((m) => publicImage(m.storage_path as string)),
    likeCount: row.like_count ?? 0,
    repostCount: row.repost_count ?? 0,
    commentCount: row.comment_count ?? 0,
    author: {
      id: p?.id ?? row.id,
      displayName: p?.display_name ?? p?.username ?? "Member",
      handle: p?.username ?? "member",
      avatarUrl: p?.avatar_url ?? null,
      steamVerified: (p?.verification_status ?? "none") !== "none",
    },
  };
}

/** Cursor-paginated feed (newest first). Pass the last item's createdAt as cursor. */
export async function getFeed(cursor?: string, limit = 20): Promise<FeedPost[]> {
  let query = supabase
    .from("posts")
    .select(SELECT)
    .in("type", ["TEXT", "IMAGE", "MEDAL_CLIP"])
    .order("created_at", { ascending: false })
    .limit(limit);
  if (cursor) query = query.lt("created_at", cursor);

  const { data, error } = await query;
  if (error || !data) return [];
  return (data as unknown as RawRow[]).map(mapRow);
}

export async function createTextPost(body: string): Promise<{ error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };
  const trimmed = body.trim();
  if (!trimmed) return { error: "Write something first." };
  const { error } = await supabase
    .from("posts")
    .insert({ author_id: user.id, type: "TEXT", source: "NATIVE", body: trimmed });
  return { error: error?.message };
}

export async function toggleLike(postId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data: existing } = await supabase
    .from("post_reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .eq("kind", "like")
    .maybeSingle();
  if (existing) {
    await supabase.from("post_reactions").delete().eq("id", existing.id);
  } else {
    await supabase.from("post_reactions").insert({ post_id: postId, user_id: user.id, kind: "like" });
  }
}
