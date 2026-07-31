import Link from "next/link";
import { CalendarDays, Trophy, Users } from "lucide-react";
import { getUpcomingTournaments } from "@/data/mock";
import { formatDateRange } from "@/lib/format";
import { Card, SectionHeader } from "@/components/ui/Card";
import { Pill } from "@/components/ui/badges";

const STATUS_LABEL: Record<string, string> = {
  registration: "Registration open",
  upcoming: "Upcoming",
  live: "Live",
  completed: "Completed",
};

const tournaments = getUpcomingTournaments().slice(0, 3);

export function UpcomingTournaments() {
  return (
    <Card className="p-4">
      <SectionHeader title="Upcoming Tournaments" viewAllHref="/tournaments" className="mb-3" />
      <ul className="grid gap-3 sm:grid-cols-3">
        {tournaments.map((t) => (
          <li key={t.id}>
            <Link
              href={`/tournaments/${t.slug}`}
              className="group flex h-full flex-col rounded-lg border border-line bg-surface p-4 transition-colors hover:border-accent/40"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent ring-1 ring-inset ring-accent/30">
                <Trophy className="h-5 w-5" />
              </div>
              <Pill tone={t.status === "registration" ? "accent" : "neutral"} className="mb-2 self-start">
                {STATUS_LABEL[t.status] ?? t.status}
              </Pill>
              <p className="font-condensed text-lg font-bold leading-tight tracking-wide text-ink">
                {t.name}
              </p>
              <div className="mt-2 space-y-1 text-xs text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDateRange(t.startDate, t.endDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {t.teamCount}/{t.maxTeams} teams
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
