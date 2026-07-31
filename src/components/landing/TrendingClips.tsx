import Link from "next/link";
import { Heart, Play } from "lucide-react";
import { getClipPosts, resolveAuthor } from "@/data/mock";
import { formatCount, formatDuration } from "@/lib/format";
import { Card, SectionHeader } from "@/components/ui/Card";
import { PitchArt } from "@/components/ui/PitchArt";

const clips = getClipPosts().slice(0, 3);

export function TrendingClips() {
  return (
    <Card className="p-4">
      <SectionHeader title="Trending Clips" viewAllHref="/feed" className="mb-3" />
      <ul className="grid gap-4 sm:grid-cols-3">
        {clips.map((post) => {
          if (post.type !== "media") return null;
          const media = post.media[0];
          const author = resolveAuthor(post.authorId);
          return (
            <li key={post.id}>
              <Link href="/feed" className="group block">
                <div className="relative aspect-video overflow-hidden rounded-lg border border-line">
                  {media && <PitchArt seed={media.id} />}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 ring-1 ring-white/30 backdrop-blur-sm transition-transform group-hover:scale-105">
                      <Play className="h-5 w-5 translate-x-0.5 fill-white text-white" />
                    </span>
                  </span>
                  {media?.durationSeconds != null && (
                    <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white">
                      {formatDuration(media.durationSeconds)}
                    </span>
                  )}
                </div>
                <p className="mt-2 line-clamp-1 text-sm font-medium text-ink">
                  {post.content}
                </p>
                <div className="mt-0.5 flex items-center justify-between text-xs text-ink-muted">
                  <span className="truncate">@{author.handle}</span>
                  <span className="inline-flex items-center gap-1">
                    <Heart className="h-3 w-3" /> {formatCount(post.stats.likes)}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
