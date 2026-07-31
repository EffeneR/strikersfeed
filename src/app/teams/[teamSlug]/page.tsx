import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Globe, Trophy, Users } from "lucide-react";
import { getTeamBySlug, players } from "@/data/mock";
import { formatCount } from "@/lib/format";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { TeamCrest } from "@/components/ui/TeamCrest";
import { Avatar } from "@/components/ui/Avatar";
import { Pill, VerifiedBadge } from "@/components/ui/badges";
import { FollowButton } from "@/components/social/FollowButton";
import { ComingSoon } from "@/components/ui/ComingSoon";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ teamSlug: string }>;
}): Promise<Metadata> {
  const { teamSlug } = await params;
  const team = getTeamBySlug(teamSlug);
  return { title: team ? team.name : "Team" };
}

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamSlug: string }>;
}) {
  const { teamSlug } = await params;
  const team = getTeamBySlug(teamSlug);
  if (!team) notFound();

  const roster = players.filter((p) => p.teamId === team.id);

  return (
    <PageContainer>
      <Link
        href="/teams"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> All teams
      </Link>

      <Card className="overflow-hidden">
        <div className="h-28 bg-gradient-to-br from-surface via-background-secondary to-background sm:h-36" />
        <div className="px-5 pb-5 sm:px-6">
          <div className="-mt-10 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <TeamCrest
                name={team.name}
                src={team.crestUrl || undefined}
                size={80}
                className="ring-4 ring-background-secondary"
              />
              <div className="pb-1">
                <h1 className="flex items-center gap-1.5 font-condensed text-2xl font-bold tracking-wide text-ink sm:text-3xl">
                  {team.name}
                  {team.isVerified && <VerifiedBadge className="h-5 w-5" />}
                </h1>
                <p className="text-sm text-ink-muted">@{team.handle}</p>
              </div>
            </div>
            <FollowButton name={team.name} size="md" />
          </div>

          {team.bio && <p className="mt-4 max-w-2xl text-sm text-ink">{team.bio}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {team.recruiting && <Pill tone="accent">Recruiting</Pill>}
            {team.division && (
              <Pill>
                <Trophy className="mr-1 h-3 w-3" /> {team.division}
              </Pill>
            )}
            {team.region && (
              <Pill>
                <Globe className="mr-1 h-3 w-3" /> {team.region}
              </Pill>
            )}
            {team.founded && (
              <Pill>
                <CalendarDays className="mr-1 h-3 w-3" /> Est. {team.founded}
              </Pill>
            )}
          </div>

          <div className="mt-5 flex gap-6 text-sm">
            <span>
              <span className="font-bold text-ink">{formatCount(team.followerCount)}</span>{" "}
              <span className="text-ink-muted">followers</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-4 w-4 text-ink-muted" />
              <span className="font-bold text-ink">{team.memberCount}</span>{" "}
              <span className="text-ink-muted">members</span>
            </span>
          </div>
        </div>
      </Card>

      {roster.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 font-condensed text-xl font-bold tracking-wide text-ink">Roster</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {roster.map((p) => (
              <Link
                key={p.id}
                href={`/players/${p.username}`}
                className="flex items-center gap-3 rounded-xl border border-line bg-background-secondary p-3 transition-colors hover:bg-surface-hover"
              >
                <Avatar name={p.displayName} src={p.avatarUrl || undefined} size={44} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{p.displayName}</p>
                  <p className="text-xs text-ink-muted">
                    {p.position} · {p.rankTier}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-6">
        <ComingSoon
          title="Team posts & fixtures coming soon"
          description="Announcements, results and this team's activity feed will appear here in a later phase."
          primary={{ label: "Browse teams", href: "/teams" }}
          secondary={{ label: "Back to Feed", href: "/feed" }}
        />
      </div>
    </PageContainer>
  );
}
