import Link from "next/link";
import type { ReactNode } from "react";
import { Pin } from "lucide-react";
import type { AuthorView } from "@/types";
import { relativeTime } from "@/data/mock";
import { Avatar } from "@/components/ui/Avatar";
import { TeamCrest } from "@/components/ui/TeamCrest";
import { VerifiedBadge, ProBadge, SteamBadge } from "@/components/ui/badges";

export function PostAuthor({
  author,
  createdAt,
  pinned,
  menu,
}: {
  author: AuthorView;
  createdAt: string;
  pinned?: boolean;
  menu?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Link href={author.profileHref} className="shrink-0" aria-label={author.displayName}>
        {author.type === "team" ? (
          <TeamCrest name={author.displayName} src={author.avatarUrl || undefined} size={44} />
        ) : (
          <Avatar name={author.displayName} src={author.avatarUrl || undefined} size={44} />
        )}
      </Link>

      <div className="min-w-0 flex-1">
        {pinned && (
          <p className="mb-0.5 flex items-center gap-1 text-[11px] font-medium text-ink-muted">
            <Pin className="h-3 w-3" /> Pinned
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0 text-sm leading-tight">
          <Link
            href={author.profileHref}
            className="font-semibold text-ink hover:underline"
          >
            {author.displayName}
          </Link>
          {author.isVerified && <VerifiedBadge />}
          {author.steamVerified && <SteamBadge />}
          {author.isPro && <ProBadge />}
          <span className="text-ink-muted">@{author.handle}</span>
          <span className="text-ink-muted" aria-hidden="true">
            ·
          </span>
          <time className="text-ink-muted" dateTime={createdAt}>
            {relativeTime(createdAt)}
          </time>
        </div>
      </div>

      {menu && <div className="shrink-0">{menu}</div>}
    </div>
  );
}
