import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MapPin, CalendarDays } from "lucide-react";
import { getPlayerByUsername, getTeam, getUserByUsername } from "@/data/mock";
import { formatCount, formatDate } from "@/lib/format";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Pill, ProBadge, VerifiedBadge } from "@/components/ui/badges";
import { FollowButton } from "@/components/social/FollowButton";
import { ComingSoon } from "@/components/ui/ComingSoon";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const user = getUserByUsername(username);
  return { title: user ? user.displayName : "Profile" };
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2.5 text-center">
      <p className="font-condensed text-xl font-bold text-ink">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-ink-muted">{label}</p>
    </div>
  );
}

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = getUserByUsername(username);

  // Mentions can point at handles that aren't real accounts yet — show a
  // polished in-layout state instead of a hard 404.
  if (!user) {
    return (
      <PageContainer>
        <ComingSoon
          title={`@${username} isn't on StrikersFeed yet`}
          description="This profile doesn't exist in the demo data. Browse players and teams to find community members."
          primary={{ label: "Browse players", href: "/players" }}
          secondary={{ label: "Back to Feed", href: "/feed" }}
        />
      </PageContainer>
    );
  }

  const player = getPlayerByUsername(username);
  const team = user.teamId ? getTeam(user.teamId) : undefined;
  const winRate = player
    ? Math.round((player.wins / Math.max(1, player.wins + player.losses)) * 100)
    : 0;

  return (
    <PageContainer>
      <Link
        href="/players"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> All players
      </Link>

      <Card className="overflow-hidden">
        <div className="h-28 bg-gradient-to-br from-surface via-background-secondary to-background sm:h-32" />
        <div className="px-5 pb-5 sm:px-6">
          <div className="-mt-10 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <Avatar
                name={user.displayName}
                src={user.avatarUrl || undefined}
                size={80}
                className="ring-4 ring-background-secondary"
              />
              <div className="pb-1">
                <h1 className="flex items-center gap-1.5 font-condensed text-2xl font-bold tracking-wide text-ink sm:text-3xl">
                  {user.displayName}
                  {user.isVerified && <VerifiedBadge className="h-5 w-5" />}
                  {user.isPro && <ProBadge />}
                </h1>
                <p className="text-sm text-ink-muted">@{user.username}</p>
              </div>
            </div>
            <FollowButton name={user.displayName} size="md" />
          </div>

          {user.bio && <p className="mt-4 max-w-2xl text-sm text-ink">{user.bio}</p>}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {player?.position && <Pill>{player.position}</Pill>}
            {player && <Pill tone="accent">{player.rankTier}</Pill>}
            {team && <Pill>{team.name}</Pill>}
            {player?.favouriteFormation && <Pill>{player.favouriteFormation}</Pill>}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-muted">
            {user.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {user.location}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" /> Joined {formatDate(user.joinedAt)}
            </span>
          </div>

          <div className="mt-5 flex gap-6 text-sm">
            <span>
              <span className="font-bold text-ink">{formatCount(user.followerCount)}</span>{" "}
              <span className="text-ink-muted">followers</span>
            </span>
            <span>
              <span className="font-bold text-ink">{formatCount(user.followingCount)}</span>{" "}
              <span className="text-ink-muted">following</span>
            </span>
          </div>
        </div>
      </Card>

      {player && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Rank pts" value={formatCount(player.rankPoints)} />
          <Stat label="Win rate" value={`${winRate}%`} />
          <Stat label="Goals" value={formatCount(player.goals)} />
          <Stat label="Assists" value={formatCount(player.assists)} />
        </div>
      )}

      <div className="mt-6">
        <ComingSoon
          title="Profile activity coming soon"
          description="This member's posts, clips and match history will appear here in a later phase."
          primary={{ label: "Browse players", href: "/players" }}
          secondary={{ label: "Back to Feed", href: "/feed" }}
        />
      </div>
    </PageContainer>
  );
}
