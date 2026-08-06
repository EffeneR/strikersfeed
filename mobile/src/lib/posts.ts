import { supabase } from "./supabase";

/**
 * Mobile reads the SAME `posts` backend as the website — no mobile-only model.
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
  medalUrl: string | null;
  creatorUsername: string | null;
  likeCount: number;
  bookmarkCount: number;
  commentCount: number;
  author: FeedAuthor;
  viewerLiked: boolean;
  viewerBookmarked: boolean;
}

export type ReactionKind = "like" | "bookmark" | "repost";

const SITE = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const publicImage = (path: string) =>
  `${SITE}/storage/v1/object/public/post-images/${path}`;

const SELECT =
  "id, body, type, created_at, like_count, bookmark_count, comment_count, author_id, " +
  "profiles ( id, username, display_name, avatar_url, verification_status ), " +
  "post_media ( storage_path, position ), " +
  "post_external_sources ( external_url, creator_username, provider )";

interface RawRow {
  id: string;
  body: string | null;
  type: string;
  created_at: string;
  like_count: number | null;
  bookmark_count: number | null;
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
  post_external_sources:
    | { external_url: string | null; creator_username: string | null; provider: string | null }[]
    | null;
}

function mapRow(row: RawRow): FeedPost {
  const p = row.profiles;
  const src = row.post_external_sources?.[0];
  return {
    id: row.id,
    body: row.body ?? "",
    createdAt: row.created_at,
    type: row.type,
    imageUrls: (row.post_media ?? [])
      .filter((m) => m.storage_path)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((m) => publicImage(m.storage_path as string)),
    medalUrl: row.type === "MEDAL_CLIP" ? src?.external_url ?? null : null,
    creatorUsername: src?.creator_username ?? null,
    likeCount: row.like_count ?? 0,
    bookmarkCount: row.bookmark_count ?? 0,
    commentCount: row.comment_count ?? 0,
    author: {
      id: p?.id ?? (row as unknown as { author_id: string }).author_id,
      displayName: p?.display_name ?? p?.username ?? "Member",
      handle: p?.username ?? "member",
      avatarUrl: p?.avatar_url ?? null,
      steamVerified: (p?.verification_status ?? "none") !== "none",
    },
    viewerLiked: false,
    viewerBookmarked: false,
  };
}

/** Attach the signed-in viewer's like/bookmark state to a list of posts. */
async function attachViewerReactions(posts: FeedPost[]): Promise<FeedPost[]> {
  if (posts.length === 0) return posts;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return posts;

  const { data } = await supabase
    .from("post_reactions")
    .select("post_id, kind")
    .eq("user_id", user.id)
    .in(
      "post_id",
      posts.map((p) => p.id),
    );
  if (!data) return posts;

  const byId = new Map(posts.map((p) => [p.id, p]));
  for (const r of data as { post_id: string; kind: string }[]) {
    const post = byId.get(r.post_id);
    if (!post) continue;
    if (r.kind === "like") post.viewerLiked = true;
    else if (r.kind === "bookmark") post.viewerBookmarked = true;
  }
  return posts;
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
  return attachViewerReactions((data as unknown as RawRow[]).map(mapRow));
}

/** A single post by id (for the post-detail screen). */
export async function getPost(id: string): Promise<FeedPost | null> {
  const { data, error } = await supabase.from("posts").select(SELECT).eq("id", id).maybeSingle();
  if (error || !data) return null;
  const [withReactions] = await attachViewerReactions([mapRow(data as unknown as RawRow)]);
  return withReactions;
}

/** A user's own posts, newest first (for profile screens). */
export async function getPostsByAuthor(userId: string, limit = 30): Promise<FeedPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(SELECT)
    .eq("author_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return attachViewerReactions((data as unknown as RawRow[]).map(mapRow));
}

/** Posts the signed-in user has bookmarked. */
export async function getBookmarks(): Promise<FeedPost[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("post_reactions")
    .select(`created_at, posts ( ${SELECT} )`)
    .eq("user_id", user.id)
    .eq("kind", "bookmark")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];

  const rows = (data as unknown as { posts: RawRow | null }[])
    .map((r) => r.posts)
    .filter((p): p is RawRow => !!p);
  return attachViewerReactions(rows.map(mapRow));
}

/** Full-text-ish search over post bodies. */
export async function searchPosts(q: string, limit = 20): Promise<FeedPost[]> {
  const term = q.trim();
  if (term.length < 2) return [];
  const { data, error } = await supabase
    .from("posts")
    .select(SELECT)
    .in("type", ["TEXT", "IMAGE", "MEDAL_CLIP"])
    .ilike("body", `%${term}%`)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return attachViewerReactions((data as unknown as RawRow[]).map(mapRow));
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

export async function createImagePost(
  body: string,
  media: { storagePath: string; width?: number; height?: number }[],
): Promise<{ error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in." };
  if (media.length === 0 || media.length > 4) return { error: "Attach between 1 and 4 images." };

  const { data, error } = await supabase
    .from("posts")
    .insert({ author_id: user.id, type: "IMAGE", source: "NATIVE", body: body.trim() })
    .select("id")
    .single();
  if (error || !data) return { error: error?.message ?? "Couldn't create the post." };

  const rows = media.map((m, i) => ({
    post_id: data.id,
    media_type: "IMAGE",
    provider: "supabase",
    storage_path: m.storagePath,
    width: m.width ?? null,
    height: m.height ?? null,
    position: i,
  }));
  const { error: mediaErr } = await supabase.from("post_media").insert(rows);
  if (mediaErr) return { error: mediaErr.message };
  return {};
}

export async function deletePost(id: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("posts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  return { error: error?.message };
}

/** Toggle a reaction (like / bookmark / repost). Returns the new on/off state. */
export async function toggleReaction(postId: string, kind: ReactionKind): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: existing } = await supabase
    .from("post_reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .eq("kind", kind)
    .maybeSingle();

  if (existing) {
    await supabase.from("post_reactions").delete().eq("id", existing.id);
    return false;
  }
  await supabase.from("post_reactions").insert({ post_id: postId, user_id: user.id, kind });
  return true;
}
