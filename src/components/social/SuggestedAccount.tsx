import Link from "next/link";
import type { AuthorView } from "@/types";
import { formatCount } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { TeamCrest } from "@/components/ui/TeamCrest";
import { VerifiedBadge } from "@/components/ui/badges";
import { FollowButton } from "./FollowButton";

export function SuggestedAccount({
  author,
  followerCount,
}: {
  author: AuthorView;
  followerCount?: number;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <Link href={author.profileHref} className="shrink-0" aria-label={author.displayName}>
        {author.type === "team" ? (
          <TeamCrest name={author.displayName} src={author.avatarUrl || undefined} size={40} />
        ) : (
          <Avatar name={author.displayName} src={author.avatarUrl || undefined} size={40} />
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={author.profileHref} className="flex items-center gap-1">
          <span className="truncate text-sm font-semibold text-ink hover:underline">
            {author.displayName}
          </span>
          {author.isVerified && <VerifiedBadge className="h-3.5 w-3.5 shrink-0" />}
        </Link>
        <span className="block truncate text-xs text-ink-muted">
          {typeof followerCount === "number"
            ? `${formatCount(followerCount)} followers`
            : `@${author.handle}`}
        </span>
      </div>
      <FollowButton name={author.displayName} />
    </div>
  );
}
