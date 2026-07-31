/**
 * DEV MOCK DATA aggregation layer.
 *
 * Central place that indexes the fictional records and exposes typed selectors
 * used by pages/components. Nothing here is real or persisted — see
 * `src/data/config.ts`. When Supabase lands, these selectors are replaced by
 * provider-backed queries with the same return shapes.
 */
import type {
  AuthorView,
  Match,
  PlayerProfile,
  SocialPost,
  Team,
  Tournament,
  User,
} from "@/types";
import { timeAgo } from "@/lib/format";

import { players } from "./players";
import { accounts } from "./accounts";
import { teams } from "./teams";
import { posts, followingAuthorIds } from "./posts";
import { matches, eliteStandings } from "./matches";
import { tournaments } from "./tournaments";
import { trendingTopics, feedCategories } from "./trending";
import { notifications } from "./notifications";
import { conversations } from "./messages";
import { DEMO_NOW } from "./time";

/** The account representing "me" in the logged-in preview. */
export const CURRENT_USER_ID = "u_arman";

/* ---- indexes -------------------------------------------------------- */

const allUsers: User[] = [...players, ...accounts];

const usersById = new Map<string, User>(allUsers.map((u) => [u.id, u]));
const usersByUsername = new Map<string, User>(
  allUsers.map((u) => [u.username.toLowerCase(), u]),
);
const teamsById = new Map<string, Team>(teams.map((t) => [t.id, t]));
const teamsBySlug = new Map<string, Team>(teams.map((t) => [t.slug, t]));
const playersById = new Map<string, PlayerProfile>(players.map((p) => [p.id, p]));
const postsById = new Map<string, SocialPost>(posts.map((p) => [p.id, p]));
const matchesById = new Map<string, Match>(matches.map((m) => [m.id, m]));
const tournamentsById = new Map<string, Tournament>(
  tournaments.map((t) => [t.id, t]),
);
const tournamentsBySlug = new Map<string, Tournament>(
  tournaments.map((t) => [t.slug, t]),
);

/* ---- lookups -------------------------------------------------------- */

export const getUser = (id: string): User | undefined => usersById.get(id);
export const getUserByUsername = (username: string): User | undefined =>
  usersByUsername.get(username.toLowerCase());
export const getPlayer = (id: string): PlayerProfile | undefined =>
  playersById.get(id);
export const getPlayerByUsername = (username: string): PlayerProfile | undefined => {
  const u = usersByUsername.get(username.toLowerCase());
  return u && u.type === "player" ? playersById.get(u.id) : undefined;
};
export const getTeam = (id: string): Team | undefined => teamsById.get(id);
export const getTeamBySlug = (slug: string): Team | undefined =>
  teamsBySlug.get(slug);
export const getPost = (id: string): SocialPost | undefined => postsById.get(id);
export const getMatch = (id: string): Match | undefined => matchesById.get(id);
export const getTournament = (id: string): Tournament | undefined =>
  tournamentsById.get(id);
export const getTournamentBySlug = (slug: string): Tournament | undefined =>
  tournamentsBySlug.get(slug);

const UNKNOWN_AUTHOR: AuthorView = {
  id: "unknown",
  displayName: "Unknown",
  handle: "unknown",
  avatarUrl: "",
  isVerified: false,
  type: "system",
  profileHref: "/feed",
};

/**
 * Project any account id (user OR team) into the normalised author shape used
 * by post components, so the UI never branches on account kind.
 */
export function resolveAuthor(id: string): AuthorView {
  const user = usersById.get(id);
  if (user) {
    return {
      id: user.id,
      displayName: user.displayName,
      handle: user.username,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      isPro: user.isPro,
      type: user.type,
      profileHref: `/players/${user.username}`,
    };
  }
  const team = teamsById.get(id);
  if (team) {
    return {
      id: team.id,
      displayName: team.name,
      handle: team.handle,
      avatarUrl: team.crestUrl,
      isVerified: team.isVerified,
      type: "team",
      profileHref: `/teams/${team.slug}`,
    };
  }
  return UNKNOWN_AUTHOR;
}

/* ---- selectors ------------------------------------------------------ */

const byNewest = (a: SocialPost, b: SocialPost) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

export const getForYouPosts = (): SocialPost[] => [...posts].sort(byNewest);

export const getFollowingPosts = (): SocialPost[] =>
  posts.filter((p) => followingAuthorIds.includes(p.authorId)).sort(byNewest);

export const getClipPosts = (): SocialPost[] =>
  posts
    .filter((p) => p.type === "media" && p.media.some((m) => m.kind === "clip"))
    .sort(byNewest);

/** Live + upcoming matches for sidebars. */
export const getLiveMatches = (): Match[] =>
  matches.filter((m) => m.status === "live" || m.status === "halftime");

export const getFeaturedMatches = (): Match[] =>
  [...matches].sort((a, b) => {
    const rank = (m: Match) =>
      m.status === "live" || m.status === "halftime" ? 0 : m.status === "scheduled" ? 1 : 2;
    return rank(a) - rank(b);
  });

export const getTopPlayers = (limit = 5): PlayerProfile[] =>
  [...players].sort((a, b) => b.rankPoints - a.rankPoints).slice(0, limit);

/** Suggested accounts to follow (teams + players not already followed). */
export function getWhoToFollow(limit = 3): AuthorView[] {
  const candidates = [...teams.map((t) => t.id), ...players.map((p) => p.id)]
    .filter((id) => id !== CURRENT_USER_ID && !followingAuthorIds.includes(id));
  return candidates.slice(0, limit).map(resolveAuthor);
}

export function getSuggestedTeams(limit = 3): Team[] {
  return teams.filter((t) => !followingAuthorIds.includes(t.id)).slice(0, limit);
}

export const getUpcomingTournaments = (): Tournament[] =>
  tournaments.filter((t) => t.status !== "completed");

/** Deterministic relative time bound to the demo clock. */
export const relativeTime = (iso: string): string => timeAgo(iso, DEMO_NOW);

/* ---- re-exports ----------------------------------------------------- */

export {
  players,
  accounts,
  teams,
  posts,
  matches,
  eliteStandings,
  tournaments,
  trendingTopics,
  feedCategories,
  notifications,
  conversations,
  followingAuthorIds,
  DEMO_NOW,
};
