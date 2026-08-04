import type { AuthorView, MediaAttachment, SocialPost } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, SUPABASE_URL } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { getForYouPosts } from "@/data/mock";

/** Minimum real posts before we stop padding the feed with demo content. */
const SEED_THRESHOLD = 8;

const POST_SELECT =
  "id, author_id, type, body, created_at, like_count, repost_count, bookmark_count, comment_count, " +
  "profiles ( id, username, display_name, avatar_url, role ), " +
  "post_media ( storage_path, alt, width, height, position ), " +
  "post_external_sources ( external_url, creator_username, creator_profile_url, provider )";

interface ProfileRow {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: string | null;
}

interface MediaRow {
  storage_path: string | null;
  alt: string | null;
  width: number | null;
  height: number | null;
  position: number | null;
}

interface ExtSourceRow {
  external_url: string | null;
  creator_username: string | null;
  creator_profile_url: string | null;
  provider: string | null;
}

function publicImageUrl(storagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/post-images/${storagePath}`;
}

function num(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

function profileToAuthor(profile: ProfileRow | null, authorId: string): AuthorView {
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

function mapPostRow(row: Record<string, unknown>): SocialPost {
  const profile = (Array.isArray(row.profiles) ? row.profiles[0] : row.profiles) as
    | ProfileRow
    | null;
  const base = {
    id: row.id as string,
    authorId: row.author_id as string,
    createdAt: row.created_at as string,
    content: (row.body as string) ?? "",
    stats: {
      replies: num(row.comment_count),
      reposts: num(row.repost_count),
      likes: num(row.like_count),
      bookmarks: num(row.bookmark_count),
    },
    author: profileToAuthor(profile, row.author_id as string),
    persistent: true,
  };

  if (row.type === "MEDAL_CLIP") {
    const src = (Array.isArray(row.post_external_sources)
      ? row.post_external_sources[0]
      : row.post_external_sources) as ExtSourceRow | null;
    if (src?.external_url) {
      return {
        ...base,
        type: "medalClip",
        medalUrl: src.external_url,
        creatorUsername: src.creator_username ?? undefined,
        creatorProfileUrl: src.creator_profile_url ?? undefined,
        medalSource: "MEDAL_MANUAL",
      };
    }
  }

  const mediaRows = (Array.isArray(row.post_media) ? (row.post_media as MediaRow[]) : [])
    .filter((m) => m.storage_path)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  if (row.type === "IMAGE" && mediaRows.length > 0) {
    const media: MediaAttachment[] = mediaRows.map((m, i) => ({
      id: `${base.id}-${i}`,
      kind: "image",
      url: publicImageUrl(m.storage_path as string),
      alt: m.alt ?? "Posted image",
      width: m.width ?? undefined,
      height: m.height ?? undefined,
      aspectRatio: m.width && m.height ? m.width / m.height : 16 / 9,
    }));
    return { ...base, type: "media", media };
  }

  return { ...base, type: "text" };
}

/** Fetch the signed-in user's reactions for the given posts and attach them. */
async function attachViewerReactions(
  supabase: SupabaseClient,
  posts: SocialPost[],
): Promise<SocialPost[]> {
  if (posts.length === 0) return posts;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return posts;

  const ids = posts.map((p) => p.id);
  const { data } = await supabase
    .from("post_reactions")
    .select("post_id, kind")
    .eq("user_id", user.id)
    .in("post_id", ids);
  if (!data) return posts;

  const map = new Map<string, { liked: boolean; reposted: boolean; bookmarked: boolean }>();
  for (const r of data as { post_id: string; kind: string }[]) {
    const cur = map.get(r.post_id) ?? { liked: false, reposted: false, bookmarked: false };
    if (r.kind === "like") cur.liked = true;
    else if (r.kind === "repost") cur.reposted = true;
    else if (r.kind === "bookmark") cur.bookmarked = true;
    map.set(r.post_id, cur);
  }
  for (const p of posts) {
    const v = map.get(p.id);
    if (v) p.viewerReactions = v;
  }
  return posts;
}

/**
 * Feed posts for the "For You" timeline. Reads real DB posts + reaction counts
 * when Supabase is configured, attaches the viewer's own reaction state, and
 * pads with mock content while real content is sparse. Falls back to mock in
 * demo mode / on any error.
 */
export async function getFeedPosts(): Promise<SocialPost[]> {
  if (!isSupabaseConfigured()) return getForYouPosts();

  try {
    const supabase = await createClient();
    if (!supabase) return getForYouPosts();

    const result = await supabase
      .from("posts")
      .select(POST_SELECT)
      .in("type", ["TEXT", "IMAGE", "MEDAL_CLIP"])
      .order("created_at", { ascending: false })
      .limit(50);

    if (result.error || !result.data) return getForYouPosts();

    const rows = result.data as unknown as Record<string, unknown>[];
    const realPosts = await attachViewerReactions(supabase, rows.map(mapPostRow));

    if (realPosts.length >= SEED_THRESHOLD) return realPosts;
    return [...realPosts, ...getForYouPosts()];
  } catch {
    return getForYouPosts();
  }
}

/** A single user's own posts (newest first), for their profile page. */
export async function getPostsByAuthor(userId: string): Promise<SocialPost[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    if (!supabase) return [];

    const result = await supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("author_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(50);

    if (result.error || !result.data) return [];
    const rows = result.data as unknown as Record<string, unknown>[];
    return attachViewerReactions(supabase, rows.map(mapPostRow));
  } catch {
    return [];
  }
}
