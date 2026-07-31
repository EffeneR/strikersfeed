/**
 * Centralized post enums (database-level).
 *
 * These UPPERCASE values match the Postgres enums in
 * `supabase/migrations/0002_posts.sql`. They are distinct from the lowercase
 * discriminant on the UI `SocialPost` union in `./index.ts` (which drives
 * rendering); {@link toSocialPostType} maps between them.
 *
 * Slice A only exercises TEXT / NATIVE / PUBLIC / VISIBLE — the remaining values
 * are defined now so later slices (image, video, Medal) don't need migrations to
 * the enum shape.
 */

import type { PostType as UIPostType } from "./index";

export const PostType = {
  TEXT: "TEXT",
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
  MEDAL_CLIP: "MEDAL_CLIP",
  MATCH: "MATCH",
  TOURNAMENT: "TOURNAMENT",
  RECRUITMENT: "RECRUITMENT",
  TEAM_UPDATE: "TEAM_UPDATE",
} as const;
export type PostType = (typeof PostType)[keyof typeof PostType];

export const PostSource = {
  NATIVE: "NATIVE",
  MEDAL_MANUAL: "MEDAL_MANUAL",
  MEDAL_CONNECTED_PROFILE: "MEDAL_CONNECTED_PROFILE",
  MEDAL_PUBLIC_DISCOVERY: "MEDAL_PUBLIC_DISCOVERY",
} as const;
export type PostSource = (typeof PostSource)[keyof typeof PostSource];

export const PostVisibility = {
  PUBLIC: "PUBLIC",
  FOLLOWERS: "FOLLOWERS",
  TEAM_ONLY: "TEAM_ONLY",
  UNLISTED: "UNLISTED",
} as const;
export type PostVisibility = (typeof PostVisibility)[keyof typeof PostVisibility];

export const ModerationStatus = {
  PENDING: "PENDING",
  VISIBLE: "VISIBLE",
  HIDDEN: "HIDDEN",
  REMOVED: "REMOVED",
} as const;
export type ModerationStatus =
  (typeof ModerationStatus)[keyof typeof ModerationStatus];

/** Map a database {@link PostType} to the UI `SocialPost` discriminant. */
export function toSocialPostType(type: PostType): UIPostType {
  switch (type) {
    case "TEXT":
      return "text";
    case "IMAGE":
    case "VIDEO":
    case "MEDAL_CLIP":
      return "media";
    case "MATCH":
      return "match";
    case "TOURNAMENT":
      return "tournament";
    case "RECRUITMENT":
      return "recruitment";
    case "TEAM_UPDATE":
      return "text";
    default:
      return "text";
  }
}
