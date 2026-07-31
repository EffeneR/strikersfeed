"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { SocialPost, TextPost } from "@/types";
import {
  CURRENT_USER_ID,
  DEMO_NOW,
  getFollowingPosts,
  getForYouPosts,
} from "@/data/mock";
import { FeedSidebar } from "./FeedSidebar";
import { FeedCenter } from "./FeedCenter";
import type { FeedTab, FeedView } from "./feedState";

const forYou = getForYouPosts();
const following = getFollowingPosts();

function isClip(post: SocialPost): boolean {
  return post.type === "media" && post.media.some((m) => m.kind === "clip");
}

export function FeedShell({
  initialTab = "for-you",
  rightRail,
}: {
  initialTab?: FeedTab;
  rightRail: ReactNode;
}) {
  const [tab, setTab] = useState<FeedTab>(initialTab);
  const [view, setView] = useState<FeedView>("all");
  const [sessionPosts, setSessionPosts] = useState<SocialPost[]>([]);

  const posts = useMemo(() => {
    const base = tab === "following" ? following : forYou;
    const combined = [...sessionPosts, ...base];
    if (view === "clips") return combined.filter(isClip);
    if (view === "bookmarks" || view === "saved") return [];
    return combined;
  }, [tab, view, sessionPosts]);

  const addPost = (text: string) => {
    const newPost: TextPost = {
      id: `session_${Date.now()}`,
      type: "text",
      authorId: CURRENT_USER_ID,
      createdAt: new Date(DEMO_NOW).toISOString(),
      content: text,
      stats: { replies: 0, reposts: 0, likes: 0, views: 0, bookmarks: 0 },
    };
    setSessionPosts((prev) => [newPost, ...prev]);
    // Ensure a freshly composed post is visible in the main timeline.
    setView("all");
    setTab("for-you");
  };

  return (
    <div className="container-shell py-4 lg:py-6">
      <div className="lg:grid lg:grid-cols-[232px_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[232px_minmax(0,1fr)_320px]">
        {/* Left sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-[4.5rem] max-h-[calc(100dvh-5.5rem)] overflow-y-auto scrollbar-slim pb-6">
            <FeedSidebar
              tab={tab}
              view={view}
              onSelectTab={setTab}
              onSelectView={setView}
            />
          </div>
        </aside>

        {/* Center feed */}
        <div className="min-w-0">
          <FeedCenter
            tab={tab}
            view={view}
            posts={posts}
            onTabChange={setTab}
            onClearView={() => setView("all")}
            onAddPost={addPost}
          />
        </div>

        {/* Right rail (server-rendered, static) */}
        <aside className="hidden xl:block">
          <div className="sticky top-[4.5rem] max-h-[calc(100dvh-5.5rem)] overflow-y-auto scrollbar-slim pb-6">
            {rightRail}
          </div>
        </aside>
      </div>
    </div>
  );
}
