/** DEV MOCK DATA — non-player accounts (official / editorial). */
import type { User } from "@/types";
import { daysAgo } from "./time";

export const accounts: User[] = [
  {
    id: "u_strikersfeed",
    username: "strikersfeed",
    displayName: "StrikersFeed",
    avatarUrl: "/assets/brand/strikersfeed-mark.png",
    bio: "The social home of Strikers Club. Community platform — independent & unofficial.",
    type: "org",
    isVerified: true,
    followerCount: 42100,
    followingCount: 12,
    joinedAt: daysAgo(800),
    location: "strikersfeed.club",
  },
  {
    id: "u_tactics",
    username: "tacticstalk",
    displayName: "Tactics Talk",
    avatarUrl: "",
    bio: "Formations, meta breakdowns and set-piece theory for Strikers Club.",
    type: "org",
    isVerified: true,
    followerCount: 31800,
    followingCount: 87,
    joinedAt: daysAgo(520),
  },
];
