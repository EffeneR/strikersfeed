import Link from "next/link";
import { CalendarDays, Flame, Trophy, Tv } from "lucide-react";
import {
  getFeaturedMatches,
  getSuggestedTeams,
  getUpcomingTournaments,
  trendingTopics,
} from "@/data/mock";
import { formatCount, formatDateRange } from "@/lib/format";
import { Card, SectionHeader } from "@/components/ui/Card";
import { TeamCrest } from "@/components/ui/TeamCrest";
import { MatchSidebarCard } from "@/components/social/MatchSidebarCard";
import { TrendingTopic } from "@/components/social/TrendingTopic";
import { FollowButton } from "@/components/social/FollowButton";

const matches = getFeaturedMatches().slice(0, 3);
const teams = getSuggestedTeams(3);
const tournaments = getUpcomingTournaments().slice(0, 2);

export function FeedRightSidebar() {
  return (
    <div className="space-y-4">
      <Card className="p-3">
        <SectionHeader
          title="Live Matches"
          icon={<Tv className="h-4 w-4 text-live" />}
          viewAllHref="/matches"
          className="px-1 pb-1"
        />
        <div className="space-y-0.5">
          {matches.map((m) => (
            <MatchSidebarCard key={m.id} match={m} />
          ))}
        </div>
      </Card>

      <Card className="p-3">
        <SectionHeader
          title="Trending"
          icon={<Flame className="h-4 w-4 text-accent" />}
          viewAllHref="/feed"
          className="px-1 pb-1"
        />
        <div>
          {trendingTopics.slice(0, 5).map((t) => (
            <TrendingTopic key={t.id} topic={t} />
          ))}
        </div>
      </Card>

      <Card className="p-3">
        <SectionHeader
          title="Suggested Teams"
          icon={<Trophy className="h-4 w-4 text-accent" />}
          viewAllHref="/teams"
          className="px-1 pb-1"
        />
        <div className="space-y-1">
          {teams.map((team) => (
            <div key={team.id} className="flex items-center gap-3 px-1 py-1.5">
              <Link href={`/teams/${team.slug}`} className="shrink-0">
                <TeamCrest name={team.name} src={team.crestUrl || undefined} size={38} />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/teams/${team.slug}`}
                  className="block truncate text-sm font-semibold text-ink hover:underline"
                >
                  {team.name}
                </Link>
                <span className="text-xs text-ink-muted">
                  {formatCount(team.followerCount)} followers
                </span>
              </div>
              <FollowButton name={team.name} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-3">
        <SectionHeader
          title="Upcoming Tournaments"
          icon={<CalendarDays className="h-4 w-4 text-accent" />}
          viewAllHref="/tournaments"
          className="px-1 pb-1"
        />
        <div className="space-y-1">
          {tournaments.map((t) => (
            <Link
              key={t.id}
              href={`/tournaments/${t.slug}`}
              className="block rounded-lg px-1 py-2 transition-colors hover:bg-surface-hover"
            >
              <p className="truncate text-sm font-semibold text-ink">{t.name}</p>
              <div className="mt-0.5 flex items-center gap-3 text-xs text-ink-muted">
                <span>{formatDateRange(t.startDate, t.endDate)}</span>
                <span>·</span>
                <span>
                  {t.teamCount}/{t.maxTeams} teams
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
