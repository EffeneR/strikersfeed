/** DEV MOCK DATA — fictional matches. "Live" here is demo only, never real. */
import type { Match, Standing } from "@/types";
import { daysAgo, inHours, minutesAgo } from "./time";

export const matches: Match[] = [
  {
    id: "m_su_vor",
    competition: "Elite Cup",
    stage: "Quarter Final",
    status: "live",
    minute: 18,
    kickoffAt: minutesAgo(18),
    home: { teamId: "t_strikers_united", name: "Strikers United", handle: "strikersunited", crestUrl: "", score: 2 },
    away: { teamId: "t_vortex", name: "Vortex FC", handle: "vortexfc", crestUrl: "", score: 1 },
    venue: "Community Arena",
    watching: 1240,
    source: "mock",
  },
  {
    id: "m_shadow_balr_live",
    competition: "Elite Division",
    stage: "Matchday 12",
    status: "live",
    minute: 63,
    kickoffAt: minutesAgo(63),
    home: { teamId: "t_shadow", name: "Shadow Esports", handle: "shadowesports", crestUrl: "", score: 3 },
    away: { teamId: "t_balr", name: "Balr Club", handle: "balrclub", crestUrl: "", score: 2 },
    watching: 856,
    source: "mock",
  },
  {
    id: "m_nextgen_high",
    competition: "Rising Series",
    stage: "Group B",
    status: "halftime",
    minute: 45,
    kickoffAt: minutesAgo(58),
    home: { teamId: "t_nextgen", name: "Next Gen", handle: "nextgenfc", crestUrl: "", score: 1 },
    away: { teamId: "t_highpress", name: "High Press", handle: "highpressfc", crestUrl: "", score: 1 },
    watching: 412,
    source: "mock",
  },
  {
    id: "m_shadow_balr_ft",
    competition: "Elite Division",
    stage: "Matchday 11",
    status: "fulltime",
    kickoffAt: daysAgo(1),
    home: { teamId: "t_shadow", name: "Shadow Esports", handle: "shadowesports", crestUrl: "", score: 3 },
    away: { teamId: "t_balr", name: "Balr Club", handle: "balrclub", crestUrl: "", score: 3 },
    penalties: { home: 4, away: 2 },
    source: "mock",
  },
  {
    id: "m_arman_nxg",
    competition: "Ranked",
    stage: "Elite Division",
    status: "fulltime",
    minute: 90,
    kickoffAt: minutesAgo(40),
    home: { teamId: "u_arman", name: "ArmanPlayz", handle: "armanplayz", crestUrl: "", score: 4 },
    away: { teamId: "t_nextgen", name: "Next Gen", handle: "nextgenfc", crestUrl: "", score: 2 },
    source: "mock",
  },
  {
    id: "m_limitless_high",
    competition: "Elite Cup",
    stage: "Quarter Final",
    status: "scheduled",
    kickoffAt: inHours(3),
    home: { teamId: "t_limitless", name: "Limitless", handle: "limitlessfc", crestUrl: "" },
    away: { teamId: "t_highpress", name: "High Press", handle: "highpressfc", crestUrl: "" },
    watching: 0,
    source: "mock",
  },
];

/** Demo standings snapshot for the Elite Division. */
export const eliteStandings: Standing[] = [
  { teamId: "t_strikers_united", teamName: "Strikers United", crestUrl: "", played: 12, won: 9, drawn: 2, lost: 1, goalDifference: 24, points: 29 },
  { teamId: "t_vortex", teamName: "Vortex FC", crestUrl: "", played: 12, won: 8, drawn: 1, lost: 3, goalDifference: 18, points: 25 },
  { teamId: "t_shadow", teamName: "Shadow Esports", crestUrl: "", played: 12, won: 7, drawn: 3, lost: 2, goalDifference: 15, points: 24 },
  { teamId: "t_balr", teamName: "Balr Club", crestUrl: "", played: 12, won: 5, drawn: 2, lost: 5, goalDifference: 2, points: 17 },
];
