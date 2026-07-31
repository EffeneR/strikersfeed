import type { Metadata } from "next";
import type { Match } from "@/types";
import { getMatchProvider } from "@/lib/providers";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { MatchResultCard } from "@/components/feed/posts/MatchResultCard";
import { Pill } from "@/components/ui/badges";

export const metadata: Metadata = {
  title: "Matches",
  description: "Live scores, upcoming fixtures and recent results from the community.",
};

function MatchGroup({ title, matches }: { title: string; matches: Match[] }) {
  if (matches.length === 0) return null;
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="font-condensed text-xl font-bold tracking-wide text-ink">{title}</h2>
        <Pill>{matches.length}</Pill>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {matches.map((m) => (
          <MatchResultCard key={m.id} match={m} />
        ))}
      </div>
    </section>
  );
}

export default async function MatchesPage() {
  const provider = getMatchProvider();
  const all = await provider.getMatches();

  const live = all.filter((m) => m.status === "live" || m.status === "halftime");
  const upcoming = all.filter((m) => m.status === "scheduled");
  const results = all.filter((m) => m.status === "fulltime");

  return (
    <PageContainer>
      <PageHeader
        title="Matches"
        description="Follow live scores, upcoming fixtures and recent results across the community. Match data shown here is demo content."
      />
      <MatchGroup title="Live Now" matches={live} />
      <MatchGroup title="Upcoming" matches={upcoming} />
      <MatchGroup title="Recent Results" matches={results} />
    </PageContainer>
  );
}
