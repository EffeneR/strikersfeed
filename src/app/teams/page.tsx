import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { teams } from "@/data/mock";
import { formatCount } from "@/lib/format";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { TeamCrest } from "@/components/ui/TeamCrest";
import { Pill, VerifiedBadge } from "@/components/ui/badges";
import { FollowButton } from "@/components/social/FollowButton";

export const metadata: Metadata = {
  title: "Teams",
  description: "Browse and follow teams competing across the Strikers Club community.",
};

export default function TeamsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Teams"
        description="Follow the rosters competing across every division. Team profiles and stats are demo content in this phase."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {teams.map((team) => (
          <Card key={team.id} className="p-5">
            <div className="flex items-start gap-3">
              <Link href={`/teams/${team.slug}`} className="shrink-0">
                <TeamCrest name={team.name} src={team.crestUrl || undefined} size={52} />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/teams/${team.slug}`}
                  className="flex items-center gap-1 font-semibold text-ink hover:underline"
                >
                  <span className="truncate">{team.name}</span>
                  {team.isVerified && <VerifiedBadge className="shrink-0" />}
                </Link>
                <p className="truncate text-xs text-ink-muted">@{team.handle}</p>
              </div>
              {team.recruiting && <Pill tone="accent">Recruiting</Pill>}
            </div>

            {team.bio && (
              <p className="mt-3 line-clamp-2 text-sm text-ink-muted">{team.bio}</p>
            )}

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-ink-muted">
                <span>{formatCount(team.followerCount)} followers</span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {team.memberCount}
                </span>
              </div>
              <FollowButton name={team.name} />
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
