/**
 * ============================================================================
 *  DEVELOPMENT MOCK DATA — NOT PRODUCTION DATA
 * ============================================================================
 *
 * Everything under `src/data/mock/` is fictional seed content used to build and
 * preview the StrikersFeed UI in Phase 1. It contains invented player names,
 * invented team names and invented statistics.
 *
 *  - No values here represent real users, real matches or real figures.
 *  - "Live" matches in this data are demo/mock only — nothing is actually live.
 *  - None of this is persisted; interactions in the browser are session-local.
 *
 * When Supabase is connected (Phase 2), production data will be fetched through
 * the provider interfaces in `src/lib/providers/` and this mock module will be
 * disabled via the flag below.
 */

/** Master switch: Phase 1 always sources UI content from mock data. */
export const USE_MOCK_DATA =
  process.env.NEXT_PUBLIC_USE_LIVE_DATA !== "true";

/** Human-readable label surfaced in dev-only UI ribbons. */
export const MOCK_DATA_NOTICE = "Demo content · not real data";
