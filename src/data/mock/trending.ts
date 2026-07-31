/** DEV MOCK DATA — trending topics & suggested feed categories. */
import type { FeedCategory, TrendingTopic } from "@/types";

export const trendingTopics: TrendingTopic[] = [
  { id: "tt_1", tag: "StrikersClub", category: "Community", postCount: 18200, rank: 1 },
  { id: "tt_2", tag: "EliteCup", category: "Matches", postCount: 12700, rank: 2 },
  { id: "tt_3", tag: "MatchReview", category: "Matches", postCount: 8900, rank: 3 },
  { id: "tt_4", tag: "RankedGrind", category: "Ranked", postCount: 6300, rank: 4 },
  { id: "tt_5", tag: "TacticsTalk", category: "Tactics", postCount: 4800, rank: 5 },
  { id: "tt_6", tag: "RoadToGlory", category: "Community", postCount: 6100, rank: 6 },
  { id: "tt_7", tag: "StrikersMoments", category: "Clips", postCount: 4300, rank: 7 },
];

export const feedCategories: FeedCategory[] = [
  { id: "cat_1", label: "Strikers Club", postCount: 125000 },
  { id: "cat_2", label: "Gameplay Clips", postCount: 94000 },
  { id: "cat_3", label: "Tactics & Tips", postCount: 76000 },
  { id: "cat_4", label: "Match Reviews", postCount: 58000 },
  { id: "cat_5", label: "Transfer Talk", postCount: 32000 },
];
