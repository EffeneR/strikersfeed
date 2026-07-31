/**
 * Match-provider factory.
 *
 * Returns the active {@link MatchProvider}. In Phase 1 this is always the local
 * mock provider. Future sources register here behind the same interface:
 *
 *   - "uub"        → professional-division matches (partner integration, later)
 *   - "tournament" → StrikersFeed's own tournament engine
 *   - "community"  → manually submitted community matches
 */
import type { MatchProvider } from "./match-provider";
import { mockMatchProvider } from "./mock-match-provider";

export type { MatchProvider, MatchQuery } from "./match-provider";

const providers: Record<string, MatchProvider> = {
  mock: mockMatchProvider,
};

export function getMatchProvider(): MatchProvider {
  // Phase 1: mock only. Later, select via env/config (e.g. NEXT_PUBLIC_USE_LIVE_DATA).
  return providers.mock;
}
