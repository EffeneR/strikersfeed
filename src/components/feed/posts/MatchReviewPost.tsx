import Link from "next/link";
import { Play } from "lucide-react";
import type { MatchReviewPost as MatchReviewPostType } from "@/types";
import { getMatch } from "@/data/mock";
import { PitchArt } from "@/components/ui/PitchArt";

export function MatchReviewPost({ post }: { post: MatchReviewPostType }) {
  const match = getMatch(post.matchId);
  const href = match ? `/matches/${match.id}` : "/matches";

  return (
    <Link
      href={href}
      className="group mt-3 block overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:border-accent/40"
    >
      <div className="relative aspect-[16/7] w-full">
        <PitchArt seed={post.id} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

        <span className="absolute left-3 top-3 rounded bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black">
          Match Review
        </span>

        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/45 ring-1 ring-white/30 backdrop-blur-sm transition-transform group-hover:scale-105">
            <Play className="h-5 w-5 translate-x-0.5 fill-white text-white" />
          </span>
        </span>

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3">
          <p className="font-condensed text-lg font-bold leading-tight tracking-wide text-white">
            {post.reviewTitle}
          </p>
          {post.durationLabel && (
            <span className="shrink-0 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white">
              {post.durationLabel}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
