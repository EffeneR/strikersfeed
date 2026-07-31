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
import type { PostStats } from "@/types";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * Interactive post action bar. Phase 1 keeps like / repost / bookmark state in
 * local component state only — nothing is written to a backend. Structured so
 * each handler can later call a Supabase mutation.
 */
export function PostActions({ stats }: { stats: PostStats }) {
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  const likeCount = stats.likes + (liked ? 1 : 0);
  const repostCount = stats.reposts + (reposted ? 1 : 0);

  const share = async () => {
    try {
      const url =
        typeof window !== "undefined" ? `${window.location.origin}/feed` : "/feed";
      if (navigator.share) {
        await navigator.share({ title: "StrikersFeed", url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      /* user dismissed share sheet or clipboard blocked — ignore */
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
        onClick={() => setReposted((v) => !v)}
      >
        <Repeat2 className="h-[18px] w-[18px]" />
      </ActionButton>

      <ActionButton
        label={liked ? "Unlike" : "Like"}
        count={likeCount}
        active={liked}
        activeClass="text-live"
        hoverClass="group-hover:text-live"
        onClick={() => setLiked((v) => !v)}
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
        onClick={() => setBookmarked((v) => !v)}
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
