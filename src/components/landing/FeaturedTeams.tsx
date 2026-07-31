import Link from "next/link";
import { getSuggestedTeams } from "@/data/mock";
import { formatCount } from "@/lib/format";
import { Card, SectionHeader } from "@/components/ui/Card";
import { TeamCrest } from "@/components/ui/TeamCrest";
import { VerifiedBadge } from "@/components/ui/badges";
import { FollowButton } from "@/components/social/FollowButton";

const teams = getSuggestedTeams(5);

export function FeaturedTeams() {
  return (
    <Card className="p-4">
      <SectionHeader title="Featured Teams" viewAllHref="/teams" className="mb-2" />
      <ul className="divide-y divide-line">
        {teams.map((team) => (
          <li key={team.id} className="flex items-center gap-3 py-2.5">
            <Link href={`/teams/${team.slug}`} className="shrink-0">
              <TeamCrest name={team.name} src={team.crestUrl || undefined} size={40} />
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/teams/${team.slug}`}
                className="flex items-center gap-1 text-sm font-semibold text-ink hover:underline"
              >
                <span className="truncate">{team.name}</span>
                {team.isVerified && <VerifiedBadge className="h-3.5 w-3.5 shrink-0" />}
              </Link>
              <span className="text-xs text-ink-muted">
                {formatCount(team.followerCount)} followers · {team.division}
              </span>
            </div>
            <FollowButton name={team.name} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
