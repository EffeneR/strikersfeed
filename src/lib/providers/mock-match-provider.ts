/** Local mock implementation of {@link MatchProvider} for Phase 1. */
import type { Match, MatchEvent, Standing } from "@/types";
import { eliteStandings, getMatch, matches } from "@/data/mock";
import type { MatchProvider, MatchQuery } from "./match-provider";

export const mockMatchProvider: MatchProvider = {
  id: "mock",
  label: "Community (demo data)",

  async getMatches(query: MatchQuery = {}): Promise<Match[]> {
    let result = [...matches];
    if (query.status) result = result.filter((m) => m.status === query.status);
    if (query.competition) {
      result = result.filter((m) => m.competition === query.competition);
    }
    if (typeof query.limit === "number") result = result.slice(0, query.limit);
    return result;
  },

  async getMatchById(id: string): Promise<Match | null> {
    return getMatch(id) ?? null;
  },

  async getStandings(_competition?: string): Promise<Standing[]> {
    return eliteStandings;
  },

  async getMatchEvents(matchId: string): Promise<MatchEvent[]> {
    return getMatch(matchId)?.events ?? [];
  },
};
