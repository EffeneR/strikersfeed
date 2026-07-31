/**
 * DEV MOCK DATA — see `src/data/config.ts`.
 *
 * A fixed reference "now" keeps every relative timestamp deterministic. Because
 * the same value is used on the server and the client, `timeAgo` renders
 * identically in both places (no hydration mismatch) and demo times never drift.
 */

export const DEMO_NOW = new Date("2026-07-31T18:30:00.000Z");

export const minutesAgo = (n: number): string =>
  new Date(DEMO_NOW.getTime() - n * 60_000).toISOString();

export const hoursAgo = (n: number): string => minutesAgo(n * 60);

export const daysAgo = (n: number): string => hoursAgo(n * 24);

export const inDays = (n: number): string =>
  new Date(DEMO_NOW.getTime() + n * 86_400_000).toISOString();

export const inHours = (n: number): string =>
  new Date(DEMO_NOW.getTime() + n * 3_600_000).toISOString();
