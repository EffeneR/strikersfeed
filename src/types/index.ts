/**
 * StrikersFeed shared domain types.
 *
 * These describe the shape of the product's data regardless of source
 * (mock data today, Supabase / external providers later). Keeping them in one
 * place means UI components never depend on where the data came from.
 */

export type ID = string;
/** ISO-8601 timestamp string, e.g. "2026-07-31T18:30:00.000Z". */
export type ISODate = string;

export type AccountType = "player" | "team" | "org" | "system";

/** A person or organisation account on StrikersFeed. */
export interface User {
  id: ID;
  /** Handle without the leading "@". */
  username: string;
  displayName: string;
  avatarUrl: string;
  bannerUrl?: string;
  bio?: string;
  type: AccountType;
  isVerified: boolean;
  isPro?: boolean;
  /** Team the account is affiliated with, if any. */
  teamId?: ID;
  followerCount: number;
  followingCount: number;
  joinedAt: ISODate;
  location?: string;
}

/** Extended competitive profile for a player account. */
export interface PlayerProfile extends User {
  type: "player";
  position?: string;
  rankPoints: number;
  rankTier: string;
  wins: number;
  losses: number;
  goals: number;
  assists: number;
  favouriteFormation?: string;
}

export interface Team {
  id: ID;
  slug: string;
  name: string;
  /** Handle without the leading "@". */
  handle: string;
  crestUrl: string;
  bannerUrl?: string;
  isVerified: boolean;
  followerCount: number;
  memberCount: number;
  division?: string;
  founded?: string;
  bio?: string;
  recruiting?: boolean;
  region?: string;
}

export interface TrendingTopic {
  id: ID;
  /** Hashtag text without the leading "#". */
  tag: string;
  category?: string;
  postCount: number;
  rank: number;
}

/* ------------------------------------------------------------------ */
/* Matches                                                            */
/* ------------------------------------------------------------------ */

export type MatchStatus = "scheduled" | "live" | "halftime" | "fulltime";

export interface MatchTeamRef {
  teamId: ID;
  name: string;
  handle: string;
  crestUrl: string;
  score?: number;
}

export type MatchEventType = "goal" | "assist" | "yellow" | "red" | "sub";

export interface MatchEvent {
  id: ID;
  minute: number;
  type: MatchEventType;
  teamId: ID;
  playerName: string;
  detail?: string;
}

export interface Standing {
  teamId: ID;
  teamName: string;
  crestUrl: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalDifference: number;
  points: number;
}

export interface Match {
  id: ID;
  competition: string;
  stage?: string;
  status: MatchStatus;
  /** Live clock in minutes, when status is live/halftime. */
  minute?: number;
  kickoffAt: ISODate;
  home: MatchTeamRef;
  away: MatchTeamRef;
  venue?: string;
  watching?: number;
  penalties?: { home: number; away: number };
  events?: MatchEvent[];
  /** Source that produced this record (mock provider in Phase 1). */
  source: MatchSourceId;
}

export type MatchSourceId = "mock" | "uub" | "tournament" | "community";

/* ------------------------------------------------------------------ */
/* Tournaments                                                        */
/* ------------------------------------------------------------------ */

export type TournamentStatus = "upcoming" | "registration" | "live" | "completed";

export interface Tournament {
  id: ID;
  slug: string;
  name: string;
  bannerUrl?: string;
  status: TournamentStatus;
  format: string;
  startDate: ISODate;
  endDate: ISODate;
  teamCount: number;
  maxTeams: number;
  /** Human description of the prize/format. Avoid fabricated cash values. */
  prizeDescription?: string;
  organiser: string;
  region?: string;
}

/* ------------------------------------------------------------------ */
/* Posts                                                              */
/* ------------------------------------------------------------------ */

export type PostType =
  | "text"
  | "media"
  | "match"
  | "matchReview"
  | "tournament"
  | "recruitment"
  | "medalClip";

export interface PostStats {
  replies: number;
  reposts: number;
  likes: number;
  views?: number;
  bookmarks?: number;
}

export interface MediaAttachment {
  id: ID;
  kind: "image" | "clip";
  /** Public URL for real uploads; empty for generative placeholders. */
  url: string;
  alt: string;
  durationSeconds?: number;
  /** width / height, used to reserve layout space. */
  aspectRatio?: number;
  width?: number;
  height?: number;
}

export interface PollOption {
  id: ID;
  label: string;
  votes: number;
}

interface BasePost {
  id: ID;
  authorId: ID;
  createdAt: ISODate;
  content: string;
  stats: PostStats;
  hashtags?: string[];
  mentions?: string[];
  pinned?: boolean;
  /**
   * Pre-resolved author. Set for real (DB-backed) posts whose author isn't in
   * the mock lookup; mock posts leave this undefined and resolve by `authorId`.
   */
  author?: AuthorView;
  /** True for real DB posts — reactions persist; mock/demo posts stay local. */
  persistent?: boolean;
  /** The current viewer's reaction state (real posts, when signed in). */
  viewerReactions?: { liked: boolean; reposted: boolean; bookmarked: boolean };
}

export interface TextPost extends BasePost {
  type: "text";
  poll?: PollOption[];
}

export interface MediaPost extends BasePost {
  type: "media";
  media: MediaAttachment[];
}

export interface MatchPost extends BasePost {
  type: "match";
  matchId: ID;
}

export interface MatchReviewPost extends BasePost {
  type: "matchReview";
  matchId: ID;
  reviewTitle: string;
  coverUrl: string;
  durationLabel?: string;
}

export interface TournamentPost extends BasePost {
  type: "tournament";
  tournamentId: ID;
}

export interface RecruitmentPost extends BasePost {
  type: "recruitment";
  teamId: ID;
  positionsWanted: string[];
  region?: string;
  minRank?: string;
}

export interface MedalClipPost extends BasePost {
  type: "medalClip";
  /** Original public Medal clip URL (validated + normalised). */
  medalUrl: string;
  creatorUsername?: string;
  creatorProfileUrl?: string;
  /** How this Medal post entered StrikersFeed (attribution). */
  medalSource: "MEDAL_MANUAL" | "MEDAL_PUBLIC_DISCOVERY" | "MEDAL_CONNECTED_PROFILE";
}

/** Discriminated union over `type` — drives the FeedPost renderer. */
export type SocialPost =
  | TextPost
  | MediaPost
  | MatchPost
  | MatchReviewPost
  | TournamentPost
  | RecruitmentPost
  | MedalClipPost;

export interface Comment {
  id: ID;
  postId: ID;
  authorId: ID;
  createdAt: ISODate;
  content: string;
  likeCount: number;
}

/* ------------------------------------------------------------------ */
/* Notifications & misc                                               */
/* ------------------------------------------------------------------ */

export type NotificationType =
  | "like"
  | "reply"
  | "repost"
  | "follow"
  | "mention"
  | "match"
  | "tournament";

export interface Notification {
  id: ID;
  type: NotificationType;
  actorId: ID;
  createdAt: ISODate;
  read: boolean;
  postId?: ID;
  text: string;
}

/** Left-sidebar suggested category. */
export interface FeedCategory {
  id: ID;
  label: string;
  postCount: number;
}

/**
 * Normalised author view used by post components. Both {@link User} and
 * {@link Team} accounts are projected into this shape so the UI never has to
 * branch on account kind.
 */
export interface AuthorView {
  id: ID;
  displayName: string;
  /** Handle without the leading "@". */
  handle: string;
  avatarUrl: string;
  isVerified: boolean;
  isPro?: boolean;
  /** Owns a verified Steam account (anti-impersonation). */
  steamVerified?: boolean;
  type: AccountType | "team";
  profileHref: string;
}
