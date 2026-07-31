import type { AuthorView, SocialPost, TextPost } from "@/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { getForYouPosts } from "@/data/mock";

/** Minimum real posts before we stop padding the feed with demo content. */
const SEED_THRESHOLD = 8;

const POST_SELECT =
  "id, author_id, body, created_at, profiles ( id, username, display_name, avatar_url, role )";

interface ProfileRow {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: string | null;
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

function mapPostRow(row: Record<string, unknown>): TextPost {
  const profile = (Array.isArray(row.profiles) ? row.profiles[0] : row.profiles) as
    | ProfileRow
    | null;
  return {
    id: row.id as string,
    type: "text",
    authorId: row.author_id as string,
    createdAt: row.created_at as string,
    content: (row.body as string) ?? "",
    stats: { replies: 0, reposts: 0, likes: 0, views: 0, bookmarks: 0 },
    author: profileToAuthor(profile, row.author_id as string),
  };
}

/**
 * Feed posts for the "For You" timeline. Reads real DB posts when Supabase is
 * configured (respecting RLS — anonymous readers see public+visible posts) and
 * pads with mock content while real content is still sparse, so the feed is
 * never empty. Falls back entirely to mock data in demo mode / on any error.
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
      .eq("type", "TEXT")
      .order("created_at", { ascending: false })
      .limit(50);

    // Table missing (migration not run yet) or a transient error → show mock.
    if (result.error || !result.data) return getForYouPosts();
    data = result.data as Record<string, unknown>[];
  } catch {
    return getForYouPosts();
  }

  const realPosts = data.map(mapPostRow);

  // While the platform is new, keep the feed populated with demo content.
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
    return (result.data as Record<string, unknown>[]).map(mapPostRow);
  } catch {
    return [];
  }
}
