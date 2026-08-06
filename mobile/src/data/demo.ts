/**
 * Sample content for the sections that have no live backend yet (matches, teams,
 * players, tournaments) — the same fictional Strikers Club universe the website
 * uses in Phase 1. Clearly demo/community sample data, never presented as real
 * verified statistics.
 */

export type CrestTone = "blue" | "violet" | "accent";

export interface DemoTeam {
  id: string;
  name: string;
  tag: string;
  followers: string;
  tone: CrestTone;
}

export interface DemoPlayer {
  id: string;
  name: string;
  handle: string;
  team: string;
  tone: CrestTone;
}

export interface DemoTournament {
  id: string;
  name: string;
  stage: string;
  format: string;
  status: "Live" | "Upcoming" | "Open";
}

export interface DemoMatch {
  id: string;
  home: string;
  homeTag: string;
  away: string;
  awayTag: string;
  homeScore: number | null;
  awayScore: number | null;
  minute: string;
  league: string;
  status: "LIVE" | "UPCOMING" | "FT";
}

export const DEMO_TEAMS: DemoTeam[] = [
  { id: "t_su", name: "Strikers United", tag: "SU", followers: "12.4K", tone: "blue" },
  { id: "t_vx", name: "Vortex FC", tag: "VX", followers: "9.1K", tone: "violet" },
  { id: "t_ph", name: "Phoenix FC", tag: "PH", followers: "8.7K", tone: "accent" },
  { id: "t_ng", name: "Next Gen", tag: "NG", followers: "5.3K", tone: "blue" },
  { id: "t_rd", name: "Raiders", tag: "RD", followers: "6.1K", tone: "violet" },
  { id: "t_hp", name: "High Press", tag: "HP", followers: "4.2K", tone: "accent" },
];

export const DEMO_PLAYERS: DemoPlayer[] = [
  { id: "p_arman", name: "ArmanPlayz", handle: "armanplayz", team: "Strikers United", tone: "blue" },
  { id: "p_lexi", name: "Lexi10", handle: "lexi10", team: "Phoenix FC", tone: "accent" },
  { id: "p_nova", name: "NovaStrike", handle: "novastrike", team: "Vortex FC", tone: "violet" },
  { id: "p_kai", name: "KaiControl", handle: "kaicontrol", team: "Next Gen", tone: "blue" },
  { id: "p_rae", name: "RaeStorm", handle: "raestorm", team: "Raiders", tone: "violet" },
];

export const DEMO_TOURNAMENTS: DemoTournament[] = [
  { id: "tr_elite", name: "Elite Cup", stage: "Quarter-final", format: "Knockout", status: "Live" },
  { id: "tr_rising", name: "Rising Series", stage: "Group Stage", format: "Groups", status: "Live" },
  { id: "tr_league", name: "Community League", stage: "Season 7", format: "Round robin", status: "Upcoming" },
  { id: "tr_invite", name: "Strikers Invitational", stage: "Registration", format: "Invite only", status: "Open" },
];

export const DEMO_MATCHES: DemoMatch[] = [
  { id: "m_1", home: "Strikers United", homeTag: "SU", away: "Vortex FC", awayTag: "VX", homeScore: 2, awayScore: 1, minute: "79'", league: "Elite Cup", status: "LIVE" },
  { id: "m_2", home: "Phoenix FC", homeTag: "PH", away: "Next Gen", awayTag: "NG", homeScore: 1, awayScore: 1, minute: "63'", league: "Elite Division", status: "LIVE" },
  { id: "m_3", home: "Raiders", homeTag: "RD", away: "High Press", awayTag: "HP", homeScore: null, awayScore: null, minute: "17:30", league: "Rising Series", status: "UPCOMING" },
  { id: "m_4", home: "Next Gen", homeTag: "NG", away: "Comet FC", awayTag: "CO", homeScore: 3, awayScore: 2, minute: "FT", league: "Community League", status: "FT" },
];

export function findMatch(id: string): DemoMatch | undefined {
  return DEMO_MATCHES.find((m) => m.id === id);
}
