import Link from "next/link";
import { MapPin, Megaphone, Trophy } from "lucide-react";
import type { RecruitmentPost as RecruitmentPostType } from "@/types";
import { getTeam } from "@/data/mock";
import { TeamCrest } from "@/components/ui/TeamCrest";
import { Pill } from "@/components/ui/badges";
import { buttonClasses } from "@/components/ui/Button";

export function RecruitmentPost({ post }: { post: RecruitmentPostType }) {
  const team = getTeam(post.teamId);
  if (!team) return null;

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-accent">
        <Megaphone className="h-3.5 w-3.5" /> Recruiting
      </div>
      <div className="flex flex-wrap items-center gap-4 p-4">
        <Link href={`/teams/${team.slug}`} className="shrink-0">
          <TeamCrest name={team.name} src={team.crestUrl || undefined} size={48} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/teams/${team.slug}`}
            className="font-semibold text-ink hover:underline"
          >
            {team.name}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {post.positionsWanted.map((pos) => (
              <Pill key={pos} tone="accent">
                {pos}
              </Pill>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
            {post.region && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {post.region}
              </span>
            )}
            {post.minRank && (
              <span className="inline-flex items-center gap-1">
                <Trophy className="h-3.5 w-3.5" /> {post.minRank}+ tier
              </span>
            )}
          </div>
        </div>
        <Link
          href={`/teams/${team.slug}`}
          className={buttonClasses("secondary", "sm", "shrink-0")}
        >
          View team
        </Link>
      </div>
    </div>
  );
}
