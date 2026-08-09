"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { toggleFollow } from "@/lib/social/actions";
import { cn } from "@/lib/cn";

/**
 * Follow toggle. When `userId` is supplied it performs a real, optimistic
 * follow/unfollow via the server action (reverting on error). Without a
 * `userId` (mock/demo surfaces) it keeps local-only state.
 */
export function FollowButton({
  name,
  userId,
  initialFollowing = false,
  size = "sm",
  full = false,
}: {
  name: string;
  userId?: string;
  initialFollowing?: boolean;
  size?: "sm" | "md";
  full?: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    const next = !following;
    setFollowing(next); // optimistic
    if (!userId || busy) return;
    setBusy(true);
    const res = await toggleFollow(userId);
    setBusy(false);
    if (!res.ok) setFollowing(!next); // revert on failure
    else setFollowing(res.following ?? next);
  };

  return (
    <button
      type="button"
      aria-pressed={following}
      aria-label={following ? `Unfollow ${name}` : `Follow ${name}`}
      onClick={onClick}
      disabled={busy}
      className={cn(
        "group inline-flex items-center justify-center gap-1.5 rounded-full font-semibold transition-colors disabled:opacity-70",
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
