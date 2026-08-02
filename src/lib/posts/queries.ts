import type { AuthorView, MediaAttachment, SocialPost } from "@/types";
import { isSupabaseConfigured, SUPABASE_URL } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { getForYouPosts } from "@/data/mock";

/** Minimum real posts before we stop padding the feed with demo content. */
const SEED_THRESHOLD = 8;

const POST_SELECT =
  "id, author_id, type, body, created_at, " +
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
  const author = profileToAuthor(profile, row.author_id as string);
  const base = {
    id: row.id as string,
    authorId: row.author_id as string,
    createdAt: row.created_at as string,
    content: (row.body as string) ?? "",
    stats: { replies: 0, reposts: 0, likes: 0, views: 0, bookmarks: 0 },
    author,
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

/**
 * Feed posts for the "For You" timeline. Reads real DB posts when Supabase is
 * configured (respecting RLS — anonymous readers see public+visible posts) and
 * pads with mock content while real content is sparse. Falls back entirely to
 * mock data in demo mode / on any error.
 */
export async function getFeedPosts(): Promise<SocialPost[]> {
  if (!isSupabaseConfigured()) return getForYouPosts();

  let data: Record<string, unknown>[] | null = null;
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
    data = result.data as unknown as Record<string, unknown>[];
  } catch {
    return getForYouPosts();
  }

  const realPosts = data.map(mapPostRow);
  if (realPosts.length >= SEED_THRESHOLD) return realPosts;
  return [...realPosts, ...getForYouPosts()];
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
    return (result.data as unknown as Record<string, unknown>[]).map(mapPostRow);
  } catch {
    return [];
  }
}
