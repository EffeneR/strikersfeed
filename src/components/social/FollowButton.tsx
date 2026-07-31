"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Follow toggle. Phase 1 uses local component state only — nothing is
 * persisted. It's structured so the click handler can later call a Supabase
 * mutation without changing the surrounding UI.
 */
export function FollowButton({
  name,
  initialFollowing = false,
  size = "sm",
  full = false,
}: {
  name: string;
  initialFollowing?: boolean;
  size?: "sm" | "md";
  full?: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  return (
    <button
      type="button"
      aria-pressed={following}
      aria-label={following ? `Unfollow ${name}` : `Follow ${name}`}
      onClick={() => setFollowing((v) => !v)}
      className={cn(
        "group inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-colors",
        size === "sm" ? "h-8 px-3.5 text-xs" : "h-9 px-4 text-sm",
        full && "w-full",
        following
          ? "border border-line bg-transparent text-ink hover:border-live/50 hover:text-live"
          : "bg-accent text-black hover:bg-accent-hover",
      )}
    >
      {following ? (
        <>
          <Check className="h-3.5 w-3.5 group-hover:hidden" />
          <span className="group-hover:hidden">Following</span>
          <span className="hidden group-hover:inline">Unfollow</span>
        </>
      ) : (
        <>
          <Plus className="h-3.5 w-3.5" />
          Follow
        </>
      )}
    </button>
  );
}
