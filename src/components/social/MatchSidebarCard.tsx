import Link from "next/link";
import type { Match } from "@/types";
import { formatCount, relativeTimeShort } from "@/lib/matchLabels";
import { TeamCrest } from "@/components/ui/TeamCrest";
import { LiveBadge } from "@/components/ui/badges";
import { cn } from "@/lib/cn";

function TeamRow({
  name,
  crestUrl,
  score,
  dim,
}: {
  name: string;
  crestUrl: string;
  score?: number;
  dim?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <TeamCrest name={name} src={crestUrl || undefined} size={22} />
        <span className={cn("truncate text-sm", dim ? "text-ink-muted" : "text-ink")}>
          {name}
        </span>
      </div>
      {typeof score === "number" && (
        <span className={cn("text-sm font-bold tabular-nums", dim ? "text-ink-muted" : "text-ink")}>
          {score}
        </span>
      )}
    </div>
  );
}

export function MatchSidebarCard({ match }: { match: Match }) {
  const isLive = match.status === "live" || match.status === "halftime";
  const homeWin = (match.home.score ?? 0) > (match.away.score ?? 0);
  const awayWin = (match.away.score ?? 0) > (match.home.score ?? 0);

  return (
    <Link
      href={`/matches/${match.id}`}
      className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-hover"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        {isLive ? (
          <LiveBadge label={match.status === "halftime" ? "HT" : `${match.minute}'`} />
        ) : (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            {match.status === "fulltime" ? "Full Time" : relativeTimeShort(match.kickoffAt)}
          </span>
        )}
        <span className="truncate text-[11px] text-ink-muted">
          {match.competition}
          {match.stage ? ` · ${match.stage}` : ""}
        </span>
      </div>

      <div className="space-y-1.5">
        <TeamRow
          name={match.home.name}
          crestUrl={match.home.crestUrl}
          score={match.home.score}
          dim={match.status === "fulltime" && !homeWin && !!awayWin}
        />
        <TeamRow
          name={match.away.name}
          crestUrl={match.away.crestUrl}
          score={match.away.score}
          dim={match.status === "fulltime" && !awayWin && !!homeWin}
        />
      </div>

      {match.penalties && (
        <p className="mt-1.5 text-[11px] text-ink-muted">
          {match.penalties.home}–{match.penalties.away} on penalties
        </p>
      )}
      {typeof match.watching === "number" && match.watching > 0 && (
        <p className="mt-1.5 text-[11px] text-ink-muted">
          {formatCount(match.watching)} watching
        </p>
      )}
    </Link>
  );
}
