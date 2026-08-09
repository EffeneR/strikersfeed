import type { Metadata } from "next";
import { FeedShell } from "@/components/feed/FeedShell";
import { FeedRightSidebar } from "@/components/feed/FeedRightSidebar";
import type { FeedTab } from "@/components/feed/feedState";
import { getFeedPosts, getFollowingFeedPosts } from "@/lib/posts/queries";

export const metadata: Metadata = {
  title: "Feed",
  description:
    "Your StrikersFeed timeline — posts, clips, match results and community discussion.",
};

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const [params, posts, followingPosts] = await Promise.all([
    searchParams,
    getFeedPosts(),
    getFollowingFeedPosts(),
  ]);
  const initialTab: FeedTab = params.tab === "following" ? "following" : "for-you";

  return (
    <FeedShell
      initialTab={initialTab}
      initialPosts={posts}
      followingPosts={followingPosts}
      rightRail={<FeedRightSidebar />}
    />
  );
}
