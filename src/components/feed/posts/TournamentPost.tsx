import Link from "next/link";
import { CalendarDays, Trophy, Users } from "lucide-react";
import type { TournamentPost as TournamentPostType } from "@/types";
import { getTournament } from "@/data/mock";
import { formatDateRange } from "@/lib/format";
import { Pill } from "@/components/ui/badges";

const STATUS_LABEL: Record<string, string> = {
  registration: "Registration open",
  upcoming: "Upcoming",
  live: "Live now",
  completed: "Completed",
};

export function TournamentPost({ post }: { post: TournamentPostType }) {
  const t = getTournament(post.tournamentId);
  if (!t) return null;

  return (
    <Link
      href={`/tournaments/${t.slug}`}
      className="group mt-3 block overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:border-accent/40"
    >
      <div className="relative flex items-center gap-4 p-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-inset ring-accent/30">
          <Trophy className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Pill tone={t.status === "registration" ? "accent" : "neutral"}>
              {STATUS_LABEL[t.status] ?? t.status}
            </Pill>
          </div>
          <p className="truncate font-condensed text-lg font-bold tracking-wide text-ink">
            {t.name}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDateRange(t.startDate, t.endDate)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {t.teamCount}/{t.maxTeams} teams
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
