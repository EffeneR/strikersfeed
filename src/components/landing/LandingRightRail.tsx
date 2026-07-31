import Link from "next/link";
import { BarChart3, Flame, Tv } from "lucide-react";
import { getFeaturedMatches, getTopPlayers, trendingTopics } from "@/data/mock";
import { formatCount } from "@/lib/format";
import { Card, SectionHeader } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { MatchSidebarCard } from "@/components/social/MatchSidebarCard";
import { TrendingTopic } from "@/components/social/TrendingTopic";

const matches = getFeaturedMatches().slice(0, 3);
const topPlayers = getTopPlayers(5);

export function LandingRightRail() {
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
          title="Trending Topics"
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
          title="Top Players"
          icon={<BarChart3 className="h-4 w-4 text-accent" />}
          viewAllHref="/rankings"
          className="px-1 pb-1"
        />
        <ul>
          {topPlayers.map((player, i) => (
            <li key={player.id}>
              <Link
                href={`/players/${player.username}`}
                className="flex items-center gap-3 rounded-lg px-1 py-1.5 transition-colors hover:bg-surface-hover"
              >
                <span className="w-4 text-center text-sm font-bold text-ink-muted tabular-nums">
                  {i + 1}
                </span>
                <Avatar name={player.displayName} src={player.avatarUrl || undefined} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">
                    {player.displayName}
                  </span>
                  <span className="block text-xs text-ink-muted">{player.rankTier}</span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-accent tabular-nums">
                  {formatCount(player.rankPoints)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
