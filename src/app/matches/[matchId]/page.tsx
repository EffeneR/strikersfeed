import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clapperboard, MessagesSquare, ScrollText, Users } from "lucide-react";
import { getMatchProvider } from "@/lib/providers";
import { relativeTimeShort } from "@/lib/matchLabels";
import { formatCount } from "@/lib/format";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { TeamCrest } from "@/components/ui/TeamCrest";
import { LiveBadge, Pill } from "@/components/ui/badges";
import { OpenInAppButton } from "@/components/app/OpenInAppButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ matchId: string }>;
}): Promise<Metadata> {
  const { matchId } = await params;
  const match = await getMatchProvider().getMatchById(matchId);
  if (!match) return { title: "Match" };
  return {
    title: `${match.home.name} vs ${match.away.name}`,
    description: `${match.competition} — ${match.home.name} vs ${match.away.name} on StrikersFeed.`,
  };
}

function ComingSoonPanel({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Card className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-accent ring-1 ring-inset ring-line">
        {icon}
      </div>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-ink-muted">{body}</p>
    </Card>
  );
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const match = await getMatchProvider().getMatchById(matchId);
  if (!match) notFound();

  const isLive = match.status === "live" || match.status === "halftime";
  const scored = typeof match.home.score === "number";

  return (
    <PageContainer>
      <div className="mb-5 flex items-center justify-between gap-3">
        <Link
          href="/matches"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> All matches
        </Link>
        <OpenInAppButton path={`/matches/${match.id}`} />
      </div>

      {/* Scoreboard */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5 text-xs uppercase tracking-wide text-ink-muted">
          <span>
            {match.competition}
            {match.stage ? ` · ${match.stage}` : ""}
          </span>
          {isLive ? (
            <LiveBadge label={match.status === "halftime" ? "HT" : `${match.minute}'`} />
          ) : (
            <span>
              {match.status === "fulltime" ? "Full Time" : relativeTimeShort(match.kickoffAt)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-8 sm:px-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <TeamCrest name={match.home.name} src={match.home.crestUrl || undefined} size={64} />
            <span className="text-sm font-semibold text-ink sm:text-base">{match.home.name}</span>
          </div>
          <div className="flex flex-col items-center">
            {scored ? (
              <span className="font-condensed text-4xl font-extrabold tabular-nums text-ink sm:text-5xl">
                {match.home.score}
                <span className="mx-2 text-ink-muted">–</span>
                {match.away.score}
              </span>
            ) : (
              <span className="font-condensed text-2xl font-bold text-ink-muted">vs</span>
            )}
            {match.penalties && (
              <span className="mt-1 text-xs text-ink-muted">
                {match.penalties.home}–{match.penalties.away} on penalties
              </span>
            )}
          </div>
          <div className="flex flex-col items-center gap-3 text-center">
            <TeamCrest name={match.away.name} src={match.away.crestUrl || undefined} size={64} />
            <span className="text-sm font-semibold text-ink sm:text-base">{match.away.name}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-line px-4 py-3 text-xs text-ink-muted">
          {match.venue && <Pill>{match.venue}</Pill>}
          {typeof match.watching === "number" && match.watching > 0 && (
            <Pill>{formatCount(match.watching)} watching</Pill>
          )}
          <Pill tone="neutral">Demo match data</Pill>
        </div>
      </Card>

      {/* Sections to be filled out in later phases */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ComingSoonPanel
          icon={<Users className="h-5 w-5" />}
          title="Rosters"
          body="Line-ups and player ratings for both sides will appear here."
        />
        <ComingSoonPanel
          icon={<MessagesSquare className="h-5 w-5" />}
          title="Match thread"
          body="Pre-match and live community discussion is coming in a later phase."
        />
        <ComingSoonPanel
          icon={<Clapperboard className="h-5 w-5" />}
          title="Clips"
          body="Highlights and community clips from this match will be collected here."
        />
        <ComingSoonPanel
          icon={<ScrollText className="h-5 w-5" />}
          title="Post-match review"
          body="A full breakdown with key moments and ratings will land after full time."
        />
      </div>
    </PageContainer>
  );
}
