/** DEV MOCK DATA — fictional notifications for the current demo user. */
import type { Notification } from "@/types";
import { hoursAgo, minutesAgo } from "./time";

export const notifications: Notification[] = [
  {
    id: "n_1",
    type: "like",
    actorId: "u_raf",
    createdAt: minutesAgo(9),
    read: false,
    postId: "p_arman_match",
    text: "liked your match result",
  },
  {
    id: "n_2",
    type: "follow",
    actorId: "u_lexi",
    createdAt: minutesAgo(48),
    read: false,
    text: "followed you",
  },
  {
    id: "n_3",
    type: "repost",
    actorId: "t_shadow",
    createdAt: hoursAgo(2),
    read: false,
    postId: "p_arman_match",
    text: "reposted your match result",
  },
  {
    id: "n_4",
    type: "mention",
    actorId: "u_tactics",
    createdAt: hoursAgo(5),
    read: true,
    postId: "p_tactics_poll",
    text: "mentioned you in a tactics thread",
  },
  {
    id: "n_5",
    type: "tournament",
    actorId: "u_strikersfeed",
    createdAt: hoursAgo(6),
    read: true,
    postId: "p_sf_tournament",
    text: "Strikers Club Championship registration is open",
  },
  {
    id: "n_6",
    type: "reply",
    actorId: "u_fearless",
    createdAt: hoursAgo(8),
    read: true,
    postId: "p_raf_text",
    text: "replied to a thread you follow",
  },
  {
    id: "n_7",
    type: "match",
    actorId: "u_strikersfeed",
    createdAt: hoursAgo(9),
    read: true,
    text: "Strikers United vs Vortex FC is now live",
  },
];
