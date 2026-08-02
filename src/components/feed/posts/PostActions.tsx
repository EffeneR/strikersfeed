"use client";

import { useState } from "react";
import {
  Bookmark,
  BarChart3,
  Heart,
  MessageCircle,
  Repeat2,
  Share,
} from "lucide-react";
import type { SocialPost } from "@/types";
import { formatCount } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { toggleReaction, type ReactionKind } from "@/lib/posts/reactions";
import { cn } from "@/lib/cn";

/**
 * Post action bar. For real (persistent) DB posts, likes/reposts/bookmarks are
 * optimistically toggled and persisted via {@link toggleReaction} (reverting on
 * failure). Mock/demo posts keep purely local state.
 */
export function PostActions({ post }: { post: SocialPost }) {
  const stats = post.stats;
  const persistent = !!post.persistent && isSupabaseConfigured();
  const base = post.viewerReactions ?? { liked: false, reposted: false, bookmarked: false };

  const [liked, setLiked] = useState(base.liked);
  const [reposted, setReposted] = useState(base.reposted);
  const [bookmarked, setBookmarked] = useState(base.bookmarked);
  const [copied, setCopied] = useState(false);

  const delta = (current: boolean, initial: boolean) =>
    current === initial ? 0 : current ? 1 : -1;

  const likeCount = stats.likes + delta(liked, base.liked);
  const repostCount = stats.reposts + delta(reposted, base.reposted);

  const persist = (kind: ReactionKind, next: boolean, revert: () => void) => {
    if (!persistent) return;
    void toggleReaction({ postId: post.id, kind }).then((res) => {
      if (!res.ok) revert();
    });
  };

  const onLike = () => {
    const next = !liked;
    setLiked(next);
    persist("like", next, () => setLiked(!next));
  };
  const onRepost = () => {
    const next = !reposted;
    setReposted(next);
    persist("repost", next, () => setReposted(!next));
  };
  const onBookmark = () => {
    const next = !bookmarked;
    setBookmarked(next);
    persist("bookmark", next, () => setBookmarked(!next));
  };

  const share = async () => {
    try {
      const url = typeof window !== "undefined" ? `${window.location.origin}/feed` : "/feed";
      if (navigator.share) {
        await navigator.share({ title: "StrikersFeed", url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      /* dismissed or blocked — ignore */
    }
  };

  return (
    <div className="mt-3 flex items-center justify-between text-ink-muted">
      <ActionButton label="Reply" count={stats.replies}>
        <MessageCircle className="h-[18px] w-[18px]" />
      </ActionButton>

      <ActionButton
        label={reposted ? "Undo repost" : "Repost"}
        count={repostCount}
        active={reposted}
        activeClass="text-emerald-400"
        hoverClass="group-hover:text-emerald-400"
        onClick={onRepost}
      >
        <Repeat2 className="h-[18px] w-[18px]" />
      </ActionButton>

      <ActionButton
        label={liked ? "Unlike" : "Like"}
        count={likeCount}
        active={liked}
        activeClass="text-live"
        hoverClass="group-hover:text-live"
        onClick={onLike}
      >
        <Heart className={cn("h-[18px] w-[18px]", liked && "fill-current")} />
      </ActionButton>

      {typeof stats.views === "number" && (
        <span className="hidden items-center gap-1.5 text-xs sm:flex">
          <BarChart3 className="h-[18px] w-[18px]" />
          {formatCount(stats.views)}
        </span>
      )}

      <ActionButton
        label={bookmarked ? "Remove bookmark" : "Bookmark"}
        active={bookmarked}
        activeClass="text-accent"
        hoverClass="group-hover:text-accent"
        onClick={onBookmark}
      >
        <Bookmark className={cn("h-[18px] w-[18px]", bookmarked && "fill-current")} />
      </ActionButton>

      <div className="relative">
        <ActionButton label="Share" hoverClass="group-hover:text-accent" onClick={share}>
          <Share className="h-[18px] w-[18px]" />
        </ActionButton>
        {copied && (
          <span className="absolute -top-8 right-0 whitespace-nowrap rounded-md bg-surface px-2 py-1 text-[11px] text-ink shadow-pop">
            Link copied
          </span>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  label,
  count,
  active,
  activeClass,
  hoverClass = "group-hover:text-ink",
  onClick,
  children,
}: {
  label: string;
  count?: number;
  active?: boolean;
  activeClass?: string;
  hoverClass?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={typeof active === "boolean" ? active : undefined}
      onClick={onClick}
      className="group flex items-center gap-1.5 text-xs transition-colors"
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
          "group-hover:bg-surface-hover",
          active ? activeClass : "text-ink-muted",
          hoverClass,
        )}
      >
        {children}
      </span>
      {typeof count === "number" && (
        <span className={cn("tabular-nums", active ? activeClass : "text-ink-muted")}>
          {formatCount(count)}
        </span>
      )}
    </button>
  );
}
