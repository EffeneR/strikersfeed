import type { Metadata } from "next";
import Link from "next/link";
import { getTeam, players } from "@/data/mock";
import { formatCount } from "@/lib/format";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Pill, ProBadge, VerifiedBadge } from "@/components/ui/badges";
import { FollowButton } from "@/components/social/FollowButton";

export const metadata: Metadata = {
  title: "Players",
  description: "Discover and follow players competing across the Strikers Club community.",
};

export default function PlayersPage() {
  const ranked = [...players].sort((a, b) => b.rankPoints - a.rankPoints);
  return (
    <PageContainer>
      <PageHeader
        title="Players"
        description="Follow the community's most active players. Profiles and ranks are demo content in this phase."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ranked.map((p) => {
          const team = p.teamId ? getTeam(p.teamId) : undefined;
          return (
            <Card key={p.id} className="p-5">
              <div className="flex items-start gap-3">
                <Link href={`/players/${p.username}`} className="shrink-0">
                  <Avatar name={p.displayName} src={p.avatarUrl || undefined} size={52} />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/players/${p.username}`}
                    className="flex items-center gap-1 font-semibold text-ink hover:underline"
                  >
                    <span className="truncate">{p.displayName}</span>
                    {p.isVerified && <VerifiedBadge className="shrink-0" />}
                    {p.isPro && <ProBadge />}
                  </Link>
                  <p className="truncate text-xs text-ink-muted">
                    @{p.username}
                    {team ? ` · ${team.name}` : ""}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Pill>{p.position}</Pill>
                <Pill tone="accent">{p.rankTier}</Pill>
                <Pill>{formatCount(p.rankPoints)} pts</Pill>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-ink-muted">
                  {formatCount(p.followerCount)} followers
                </span>
                <FollowButton name={p.displayName} />
              </div>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
