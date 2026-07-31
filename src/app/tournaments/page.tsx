import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Globe, Trophy, Users } from "lucide-react";
import { tournaments } from "@/data/mock";
import { formatDateRange } from "@/lib/format";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/badges";
import { buttonClasses } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Tournaments",
  description: "Community tournaments and cups — browse, follow and register your team.",
};

const STATUS: Record<string, { label: string; tone: "accent" | "neutral" | "live" }> = {
  registration: { label: "Registration open", tone: "accent" },
  upcoming: { label: "Upcoming", tone: "neutral" },
  live: { label: "Live", tone: "live" },
  completed: { label: "Completed", tone: "neutral" },
};

export default function TournamentsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Tournaments"
        description="Community-run cups and championships. Registration and brackets are demo content in this phase."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tournaments.map((t) => {
          const status = STATUS[t.status] ?? { label: t.status, tone: "neutral" as const };
          const pct = Math.min(100, Math.round((t.teamCount / t.maxTeams) * 100));
          return (
            <Card key={t.id} className="flex flex-col p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-inset ring-accent/30">
                  <Trophy className="h-6 w-6" />
                </div>
                <Pill tone={status.tone}>{status.label}</Pill>
              </div>

              <h2 className="font-condensed text-xl font-bold leading-tight tracking-wide text-ink">
                {t.name}
              </h2>
              {t.prizeDescription && (
                <p className="mt-1 text-sm text-ink-muted">{t.prizeDescription}</p>
              )}

              <dl className="mt-4 space-y-1.5 text-xs text-ink-muted">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDateRange(t.startDate, t.endDate)}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" /> {t.format}
                </div>
                {t.region && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5" /> {t.region}
                  </div>
                )}
              </dl>

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs text-ink-muted">
                  <span>Teams</span>
                  <span className="tabular-nums">
                    {t.teamCount}/{t.maxTeams}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <Link
                href={`/tournaments/${t.slug}`}
                className={buttonClasses("secondary", "md", "mt-5 w-full")}
              >
                View tournament
              </Link>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
