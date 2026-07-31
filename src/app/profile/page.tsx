import type { Metadata } from "next";
import { CalendarDays, MapPin } from "lucide-react";
import { CURRENT_USER_ID, getPlayer, getTeam, getUser, posts } from "@/data/mock";
import { formatCount, formatDate } from "@/lib/format";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Pill, ProBadge, VerifiedBadge } from "@/components/ui/badges";
import { FeedPost } from "@/components/feed/posts/FeedPost";
import { DemoRolePill } from "@/components/profile/DemoRolePill";

export const metadata: Metadata = {
  title: "Your Profile",
  description: "Your StrikersFeed profile.",
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2.5 text-center">
      <p className="font-condensed text-xl font-bold text-ink">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-ink-muted">{label}</p>
    </div>
  );
}

export default function ProfilePage() {
  const me = getUser(CURRENT_USER_ID)!;
  const player = getPlayer(CURRENT_USER_ID);
  const team = me.teamId ? getTeam(me.teamId) : undefined;
  const myPosts = posts.filter((p) => p.authorId === CURRENT_USER_ID);
  const winRate = player
    ? Math.round((player.wins / Math.max(1, player.wins + player.losses)) * 100)
    : 0;

  return (
    <PageContainer>
      <Card className="overflow-hidden">
        <div className="h-28 bg-gradient-to-br from-surface via-background-secondary to-background sm:h-32" />
        <div className="px-5 pb-5 sm:px-6">
          <div className="-mt-10 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <Avatar
                name={me.displayName}
                src={me.avatarUrl || undefined}
                size={80}
                className="ring-4 ring-background-secondary"
              />
              <div className="pb-1">
                <h1 className="flex items-center gap-1.5 font-condensed text-2xl font-bold tracking-wide text-ink sm:text-3xl">
                  {me.displayName}
                  {me.isVerified && <VerifiedBadge className="h-5 w-5" />}
                  {me.isPro && <ProBadge />}
                </h1>
                <p className="text-sm text-ink-muted">@{me.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DemoRolePill />
              <span className="rounded-full border border-line px-4 py-2 text-xs font-medium text-ink-muted">
                You · demo profile
              </span>
            </div>
          </div>

          {me.bio && <p className="mt-4 max-w-2xl text-sm text-ink">{me.bio}</p>}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {player?.position && <Pill>{player.position}</Pill>}
            {player && <Pill tone="accent">{player.rankTier}</Pill>}
            {team && <Pill>{team.name}</Pill>}
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-muted">
            {me.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {me.location}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" /> Joined {formatDate(me.joinedAt)}
            </span>
          </div>

          <div className="mt-5 flex gap-6 text-sm">
            <span>
              <span className="font-bold text-ink">{formatCount(me.followerCount)}</span>{" "}
              <span className="text-ink-muted">followers</span>
            </span>
            <span>
              <span className="font-bold text-ink">{formatCount(me.followingCount)}</span>{" "}
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

      <h2 className="mb-3 mt-8 font-condensed text-xl font-bold tracking-wide text-ink">
        Your posts
      </h2>
      <Card className="divide-y divide-line overflow-hidden">
        {myPosts.length > 0 ? (
          myPosts.map((post) => <FeedPost key={post.id} post={post} />)
        ) : (
          <p className="px-4 py-10 text-center text-sm text-ink-muted">
            You haven&apos;t posted yet.
          </p>
        )}
      </Card>
    </PageContainer>
  );
}
