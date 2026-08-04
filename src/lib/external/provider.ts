/**
 * External clip provider interface.
 *
 * Medal, Twitch and any future source implement this behind a single contract,
 * so the importer + feed never touch provider-specific response structures. All
 * results are normalised (see `@/types/external`). Real providers use OFFICIAL
 * APIs (Twitch Helix, Medal developer API) — never scraping.
 */
import type {
  ExternalClipDiscoveryResult,
  ExternalProvider,
  NormalizedClip,
  NormalizedCreator,
} from "@/types/external";

export interface DiscoverInput {
  cursor?: string;
  limit?: number;
}

export interface ExternalClipProvider {
  readonly provider: ExternalProvider;
  readonly label: string;
  /** True only when the provider's required credentials are configured. */
  isConfigured(): boolean;

  discoverClips(input?: DiscoverInput): Promise<ExternalClipDiscoveryResult>;
  getClip(externalClipId: string): Promise<NormalizedClip | null>;
  getCreator(externalCreatorId: string): Promise<NormalizedCreator | null>;
  /** Optional: check whether a clip is still live on the source platform. */
  checkAvailability?(externalClipId: string): Promise<boolean>;
}
