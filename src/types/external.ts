/**
 * Normalised external-content types.
 *
 * Provider-agnostic shapes that Medal / Twitch (or any future source) are mapped
 * INTO, so the feed and importer never depend on a provider's raw response.
 * These mirror the `external_creators` / `external_clips` / `import_jobs` tables
 * in `supabase/migrations/0005_external_clips.sql`.
 */

export type ExternalProvider = "medal" | "twitch";

export type ImportJobStatus = "RUNNING" | "COMPLETED" | "PARTIAL" | "FAILED";

export type ClipAvailability = "AVAILABLE" | "UNAVAILABLE" | "UNKNOWN";

/** A creator on an external platform (never a StrikersFeed account). */
export interface NormalizedCreator {
  provider: ExternalProvider;
  /** Stable id from the provider. */
  externalCreatorId: string;
  username: string;
  displayName?: string;
  profileUrl: string;
  avatarUrl?: string;
}

/** A single clip normalised from a provider. */
export interface NormalizedClip {
  provider: ExternalProvider;
  /** Stable id from the provider — used for dedup with UNIQUE(provider, id). */
  externalClipId: string;
  /** Canonical public URL of the clip on the source platform. */
  canonicalUrl: string;
  title: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  originalPublishedAt?: string;
  creator: NormalizedCreator;
  /** Provider-specific extras (kept out of typed columns). */
  rawMetadata?: Record<string, unknown>;
}

export interface ExternalClipDiscoveryResult {
  clips: NormalizedClip[];
  /** Opaque pagination cursor to resume from next run, if any. */
  cursor?: string;
}

/** Author projection for rendering an external-creator post in the feed. */
export interface ExternalAuthorView {
  provider: ExternalProvider;
  username: string;
  displayName: string;
  profileUrl: string;
  avatarUrl?: string;
  /** True when this creator has claimed/linked a StrikersFeed account. */
  linked: boolean;
}
