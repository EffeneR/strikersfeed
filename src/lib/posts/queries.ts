import type { AuthorView, SocialPost, TextPost } from "@/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { getForYouPosts } from "@/data/mock";

/** Minimum real posts before we stop padding the feed with demo content. */
const SEED_THRESHOLD = 8;

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

/**
 * Feed posts for the "For You" timeline. Reads real DB posts when Supabase is
 * configured (respecting RLS — anonymous readers see public+visible posts) and
 * pads with mock content while real content is still sparse, so the feed is
 * never empty. Falls back entirely to mock data in demo mode.
 */
export async function getFeedPosts(): Promise<SocialPost[]> {
  if (!isSupabaseConfigured()) return getForYouPosts();

  let data: Record<string, unknown>[] | null = null;
  try {
    const supabase = await createClient();
    if (!supabase) return getForYouPosts();

    const result = await supabase
      .from("posts")
      .select(
        "id, author_id, body, created_at, profiles ( id, username, display_name, avatar_url, role )",
      )
      .eq("type", "TEXT")
      .order("created_at", { ascending: false })
      .limit(50);

    // Table missing (migration not run yet) or a transient error → show mock.
    if (result.error || !result.data) return getForYouPosts();
    data = result.data as Record<string, unknown>[];
  } catch {
    return getForYouPosts();
  }

  const realPosts: TextPost[] = data.map((row) => {
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
  });

  // While the platform is new, keep the feed populated with demo content.
  if (realPosts.length >= SEED_THRESHOLD) return realPosts;
  return [...realPosts, ...getForYouPosts()];
}
