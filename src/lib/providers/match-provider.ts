/**
 * Match provider interface.
 *
 * StrikersFeed can eventually source matches from multiple places — a future
 * UUB professional-division integration, its own tournament engine, or manual
 * community submissions. The UI depends ONLY on this interface, so new sources
 * can be added without rewriting any pages/components.
 *
 * Phase 1 ships a single local mock provider (see `mock-match-provider.ts`).
 */
import type { Match, MatchEvent, MatchSourceId, Standing } from "@/types";

export interface MatchQuery {
  status?: Match["status"];
  competition?: string;
  limit?: number;
}

export interface MatchProvider {
  /** Stable identifier for the source (used for attribution/debugging). */
  readonly id: MatchSourceId;
  readonly label: string;

  getMatches(query?: MatchQuery): Promise<Match[]>;
  getMatchById(id: string): Promise<Match | null>;
  getStandings(competition?: string): Promise<Standing[]>;
  getMatchEvents(matchId: string): Promise<MatchEvent[]>;
}
