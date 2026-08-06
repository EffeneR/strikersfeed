import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Globe, ListTree, Trophy, Users } from "lucide-react";
import { getTournamentBySlug } from "@/data/mock";
import { formatDateRange } from "@/lib/format";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/badges";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { OpenInAppButton } from "@/components/app/OpenInAppButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tournamentId: string }>;
}): Promise<Metadata> {
  const { tournamentId } = await params;
  const t = getTournamentBySlug(tournamentId);
  return { title: t ? t.name : "Tournament" };
}

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ tournamentId: string }>;
}) {
  const { tournamentId } = await params;
  const t = getTournamentBySlug(tournamentId);
  if (!t) notFound();

  const pct = Math.min(100, Math.round((t.teamCount / t.maxTeams) * 100));

  return (
    <PageContainer>
      <div className="mb-5 flex items-center justify-between gap-3">
        <Link
          href="/tournaments"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> All tournaments
        </Link>
        <OpenInAppButton path={`/tournaments/${t.slug}`} />
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-inset ring-accent/30">
              <Trophy className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-condensed text-3xl font-bold tracking-wide text-ink">
                {t.name}
              </h1>
              <p className="text-sm text-ink-muted">Organised by {t.organiser}</p>
            </div>
          </div>
          <Pill tone={t.status === "registration" ? "accent" : "neutral"}>
            {t.status === "registration" ? "Registration open" : t.status}
          </Pill>
        </div>

        {t.prizeDescription && (
          <p className="mt-4 text-sm text-ink">{t.prizeDescription}</p>
        )}

        <dl className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <CalendarDays className="h-4 w-4 text-accent" />
            {formatDateRange(t.startDate, t.endDate)}
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <ListTree className="h-4 w-4 text-accent" />
            {t.format}
          </div>
          {t.region && (
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <Globe className="h-4 w-4 text-accent" />
              {t.region}
            </div>
          )}
        </dl>

        <div className="mt-6 max-w-sm">
          <div className="mb-1 flex items-center justify-between text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> Teams registered
            </span>
            <span className="tabular-nums">
              {t.teamCount}/{t.maxTeams}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface">
            <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </Card>

      <div className="mt-6">
        <ComingSoon
          title="Bracket & registration coming soon"
          description="The live bracket, team registration and results for this tournament will be available in a later phase. Tournament data shown here is demo content."
          primary={{ label: "Browse tournaments", href: "/tournaments" }}
          secondary={{ label: "Back to Feed", href: "/feed" }}
        />
      </div>
    </PageContainer>
  );
}
