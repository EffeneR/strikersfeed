import type { Metadata } from "next";
import Link from "next/link";
import { getTeam, players } from "@/data/mock";
import { formatCount } from "@/lib/format";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Pill } from "@/components/ui/badges";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Rankings",
  description: "The community leaderboard — ranked by points across the season.",
};

export default function RankingsPage() {
  const ranked = [...players].sort((a, b) => b.rankPoints - a.rankPoints);

  return (
    <PageContainer>
      <PageHeader
        title="Rankings"
        description="Season leaderboard ranked by points. Rankings shown here are demo content in this phase."
      />

      <Card className="overflow-hidden">
        {/* Table header (desktop) */}
        <div className="hidden grid-cols-[3rem_1fr_5rem_5rem_6rem] gap-4 border-b border-line px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted sm:grid">
          <span>#</span>
          <span>Player</span>
          <span className="text-center">Tier</span>
          <span className="text-center">W–L</span>
          <span className="text-right">Points</span>
        </div>

        <ul className="divide-y divide-line">
          {ranked.map((p, i) => {
            const team = p.teamId ? getTeam(p.teamId) : undefined;
            const rank = i + 1;
            return (
              <li key={p.id}>
                <Link
                  href={`/players/${p.username}`}
                  className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-hover sm:grid-cols-[3rem_1fr_5rem_5rem_6rem] sm:gap-4"
                >
                  <span
                    className={cn(
                      "text-center font-condensed text-lg font-bold tabular-nums",
                      rank === 1
                        ? "text-accent"
                        : rank <= 3
                          ? "text-ink"
                          : "text-ink-muted",
                    )}
                  >
                    {rank}
                  </span>

                  <span className="flex min-w-0 items-center gap-3">
                    <Avatar name={p.displayName} src={p.avatarUrl || undefined} size={38} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {p.displayName}
                      </span>
                      <span className="block truncate text-xs text-ink-muted">
                        {p.position}
                        {team ? ` · ${team.name}` : ""}
                      </span>
                    </span>
                  </span>

                  <span className="hidden justify-center sm:flex">
                    <Pill tone="accent">{p.rankTier}</Pill>
                  </span>

                  <span className="hidden text-center text-sm text-ink-muted tabular-nums sm:block">
                    {p.wins}–{p.losses}
                  </span>

                  <span className="text-right text-sm font-bold text-accent tabular-nums">
                    {formatCount(p.rankPoints)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>
    </PageContainer>
  );
}
