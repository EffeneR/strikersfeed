import { Play } from "lucide-react";
import type { MediaPost as MediaPostType, MediaAttachment } from "@/types";
import { PitchArt } from "@/components/ui/PitchArt";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/cn";

function MediaTile({ media }: { media: MediaAttachment }) {
  const isClip = media.kind === "clip";
  return (
    <figure className="relative overflow-hidden rounded-xl border border-line bg-surface">
      <div className="aspect-video w-full">
        <PitchArt seed={media.id} />
      </div>

      {isClip && (
        <>
          {/* Decorative play affordance — no real playback in Phase 1. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/45 ring-1 ring-white/30 backdrop-blur-sm">
              <Play className="h-6 w-6 translate-x-0.5 fill-white text-white" />
            </span>
          </span>
          {typeof media.durationSeconds === "number" && (
            <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white">
              {formatDuration(media.durationSeconds)}
            </span>
          )}
          <span className="absolute left-2 top-2 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Clip
          </span>
        </>
      )}

      <figcaption className="sr-only">{media.alt}</figcaption>
    </figure>
  );
}

export function MediaPost({ post }: { post: MediaPostType }) {
  const many = post.media.length > 1;
  return (
    <div className={cn("mt-3 grid gap-2", many ? "grid-cols-2" : "grid-cols-1")}>
      {post.media.map((m) => (
        <MediaTile key={m.id} media={m} />
      ))}
    </div>
  );
}
