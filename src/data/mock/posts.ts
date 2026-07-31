/** DEV MOCK DATA — fictional social posts driving the Feed. */
import type { SocialPost } from "@/types";
import { hoursAgo, minutesAgo } from "./time";

export const posts: SocialPost[] = [
  {
    id: "p_arman_match",
    type: "match",
    authorId: "u_arman",
    createdAt: minutesAgo(15),
    content:
      "Ranked grind doesn't stop. Big W in the Elite Division 💪 Shoutout to @nextgen for the tough games!",
    matchId: "m_arman_nxg",
    hashtags: ["StrikersClub", "Ranked", "EliteDivision"],
    mentions: ["nextgen"],
    stats: { replies: 24, reposts: 18, likes: 142, views: 3200, bookmarks: 12 },
  },
  {
    id: "p_sf_review",
    type: "matchReview",
    authorId: "u_strikersfeed",
    createdAt: hoursAgo(1),
    content:
      "MATCH REVIEW: Strikers United vs Vortex FC — Elite Cup Quarter Final. Full breakdown, key moments and player ratings 👇",
    matchId: "m_su_vor",
    reviewTitle: "Strikers United vs Vortex FC",
    coverUrl: "",
    durationLabel: "6:45",
    hashtags: ["MatchReview", "EliteCup"],
    stats: { replies: 18, reposts: 11, likes: 89, views: 2100, bookmarks: 34 },
  },
  {
    id: "p_shadow_match",
    type: "match",
    authorId: "t_shadow",
    createdAt: hoursAgo(2),
    content:
      "That comeback tho. Down 0-2 and we take it to penalties. Mentality 🖤💚",
    matchId: "m_shadow_balr_ft",
    hashtags: ["EliteDivision"],
    stats: { replies: 37, reposts: 21, likes: 187, views: 4600, bookmarks: 9 },
  },
  {
    id: "p_tactics_poll",
    type: "text",
    authorId: "u_tactics",
    createdAt: hoursAgo(3),
    content:
      "4-2-3-1 vs 4-1-2-1-2 in Strikers Club — which one is meta right now? Breakdown + pros & cons 🧵",
    hashtags: ["TacticsTalk"],
    poll: [
      { id: "po_1", label: "4-2-3-1", votes: 1840 },
      { id: "po_2", label: "4-1-2-1-2", votes: 1210 },
      { id: "po_3", label: "Something else", votes: 430 },
    ],
    stats: { replies: 46, reposts: 14, likes: 233, views: 5100, bookmarks: 41 },
  },
  {
    id: "p_dribbl_clip",
    type: "media",
    authorId: "u_dribbl",
    createdAt: hoursAgo(4),
    content: "Nasty skill move to set up the winner 🔥",
    media: [
      {
        id: "md_1",
        kind: "clip",
        url: "",
        alt: "Gameplay clip: a player beats two defenders with a skill move before assisting a goal",
        durationSeconds: 18,
        aspectRatio: 16 / 9,
      },
    ],
    hashtags: ["StrikersMoments"],
    stats: { replies: 12, reposts: 27, likes: 210, views: 8800, bookmarks: 18 },
  },
  {
    id: "p_high_recruit",
    type: "recruitment",
    authorId: "t_highpress",
    createdAt: hoursAgo(5),
    content:
      "High Press is recruiting for the Rising Series 📣 Looking for a clinical striker and a ball-playing centre-back. Elite tier and up.",
    teamId: "t_highpress",
    positionsWanted: ["ST", "CB"],
    region: "EU",
    minRank: "Elite",
    hashtags: ["StrikersClub"],
    stats: { replies: 31, reposts: 22, likes: 76, views: 1900, bookmarks: 15 },
  },
  {
    id: "p_sf_tournament",
    type: "tournament",
    authorId: "u_strikersfeed",
    createdAt: hoursAgo(6),
    content:
      "Registration is OPEN for the Strikers Club Championship 🏆 Single elimination, 32 teams, all community. Lock in your roster now.",
    tournamentId: "tr_scc",
    hashtags: ["StrikersClub", "EliteCup"],
    stats: { replies: 54, reposts: 63, likes: 298, views: 7400, bookmarks: 120 },
  },
  {
    id: "p_lexi_clip",
    type: "media",
    authorId: "u_lexi",
    createdAt: hoursAgo(7),
    content: "Top bins from outside the box 🎯 what a strike",
    media: [
      {
        id: "md_2",
        kind: "clip",
        url: "",
        alt: "Gameplay clip: a long-range shot flies into the top corner",
        durationSeconds: 12,
        aspectRatio: 16 / 9,
      },
    ],
    hashtags: ["StrikersMoments"],
    stats: { replies: 9, reposts: 15, likes: 188, views: 6200, bookmarks: 7 },
  },
  {
    id: "p_raf_text",
    type: "text",
    authorId: "u_raf",
    createdAt: hoursAgo(8),
    content: "New tactic unlocked. 4-2-3-1 is filthy right now 🔥 who's grinding tonight?",
    hashtags: ["RankedGrind"],
    stats: { replies: 22, reposts: 8, likes: 142, views: 3800, bookmarks: 5 },
  },
  {
    id: "p_clutch_text",
    type: "text",
    authorId: "u_clutch",
    createdAt: hoursAgo(9),
    content: "Kept a clean sheet vs the #1 attack in Elite. GK diff 🧤🧱",
    stats: { replies: 14, reposts: 6, likes: 121, views: 2600, bookmarks: 3 },
  },
  {
    id: "p_vortex_media",
    type: "media",
    authorId: "t_vortex",
    createdAt: hoursAgo(11),
    content: "Matchday. New away kit drop 🖤⚡ Who's tuning in tonight?",
    media: [
      {
        id: "md_3",
        kind: "image",
        url: "",
        alt: "Vortex FC matchday graphic in black and lime",
        aspectRatio: 16 / 9,
      },
    ],
    hashtags: ["EliteCup"],
    stats: { replies: 17, reposts: 12, likes: 164, views: 3100, bookmarks: 6 },
  },
];

/** Ids of accounts the current demo user follows (drives the Following tab). */
export const followingAuthorIds = [
  "u_strikersfeed",
  "u_raf",
  "u_lexi",
  "t_shadow",
  "t_vortex",
  "u_tactics",
];
