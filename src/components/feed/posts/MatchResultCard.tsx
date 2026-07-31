import Link from "next/link";
import type { Match } from "@/types";
import { relativeTimeShort } from "@/lib/matchLabels";
import { TeamCrest } from "@/components/ui/TeamCrest";
import { LiveBadge } from "@/components/ui/badges";
import { cn } from "@/lib/cn";

function statusLabel(match: Match): string {
  switch (match.status) {
    case "fulltime":
      return "Full Time";
    case "halftime":
      return "Half Time";
    case "scheduled":
      return relativeTimeShort(match.kickoffAt);
    default:
      return `${match.minute ?? 0}'`;
  }
}

function Side({
  name,
  crestUrl,
  align,
}: {
  name: string;
  crestUrl: string;
  align: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2.5",
        align === "right" && "flex-row-reverse text-right",
      )}
    >
      <TeamCrest name={name} src={crestUrl || undefined} size={40} />
      <span className="min-w-0 truncate text-sm font-semibold text-ink">{name}</span>
    </div>
  );
}

/** Compact match score card embedded in match posts and match detail pages. */
export function MatchResultCard({ match }: { match: Match }) {
  const isLive = match.status === "live" || match.status === "halftime";
  const scored = typeof match.home.score === "number";

  return (
    <Link
      href={`/matches/${match.id}`}
      className="mt-3 block overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:bg-surface-hover"
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-2 text-[11px] uppercase tracking-wide text-ink-muted">
        <span className="truncate">
          {match.competition}
          {match.stage ? ` · ${match.stage}` : ""}
        </span>
        {isLive ? (
          <LiveBadge label={match.status === "halftime" ? "HT" : `${match.minute}'`} />
        ) : (
          <span>{statusLabel(match)}</span>
        )}
      </div>

      <div className="flex items-center gap-3 px-4 py-4">
        <Side name={match.home.name} crestUrl={match.home.crestUrl} align="left" />
        <div className="flex shrink-0 flex-col items-center px-1">
          {scored ? (
            <span className="font-condensed text-2xl font-bold tabular-nums text-ink">
              {match.home.score}
              <span className="mx-1.5 text-ink-muted">–</span>
              {match.away.score}
            </span>
          ) : (
            <span className="font-condensed text-xl font-bold text-ink-muted">vs</span>
          )}
          {match.penalties && (
            <span className="text-[11px] text-ink-muted">
              ({match.penalties.home}–{match.penalties.away} pens)
            </span>
          )}
        </div>
        <Side name={match.away.name} crestUrl={match.away.crestUrl} align="right" />
      </div>
    </Link>
  );
}
