import { Clapperboard, ExternalLink } from "lucide-react";
import type { MedalClipPost as MedalClipPostType } from "@/types";
import { buttonClasses } from "@/components/ui/Button";

const SOURCE_LABEL: Record<MedalClipPostType["medalSource"], string> = {
  MEDAL_MANUAL: "Medal Clip",
  MEDAL_PUBLIC_DISCOVERY: "Imported from Medal",
  MEDAL_CONNECTED_PROFILE: "Imported from Medal",
};

/**
 * Attributed card for a Medal clip link. StrikersFeed never hosts or proxies the
 * clip — this always shows the source and links out to the original on Medal.
 */
export function MedalClipPost({ post }: { post: MedalClipPostType }) {
  let host = "medal.tv";
  try {
    host = new URL(post.medalUrl).hostname;
  } catch {
    /* keep default */
  }

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex items-center gap-1.5 border-b border-line px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-ink-muted">
        <Clapperboard className="h-3.5 w-3.5 text-accent" />
        {SOURCE_LABEL[post.medalSource]}
      </div>
      <div className="flex items-center gap-3 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background-secondary text-accent ring-1 ring-inset ring-line">
          <Clapperboard className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">
            {post.creatorUsername ? `Clip by @${post.creatorUsername}` : "Medal clip"}
          </p>
          <p className="truncate text-xs text-ink-muted">
            Hosted on {host}
            {post.creatorProfileUrl && post.creatorUsername ? (
              <>
                {" · "}
                <a
                  href={post.creatorProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-accent hover:underline"
                >
                  creator profile
                </a>
              </>
            ) : null}
          </p>
        </div>
        <a
          href={post.medalUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className={buttonClasses("secondary", "sm", "shrink-0 gap-1.5")}
        >
          View on Medal <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
