import { DEMO_NOW } from "@/data/mock/time";
import { formatCount } from "./format";

export { formatCount };

/**
 * Deterministic relative label for an upcoming kickoff, bound to the demo
 * clock. Avoids locale/timezone formatting so server and client output match.
 */
export function relativeTimeShort(iso: string): string {
  const diffMs = new Date(iso).getTime() - DEMO_NOW.getTime();
  if (diffMs <= 0) return "Kickoff";
  const mins = Math.round(diffMs / 60_000);
  if (mins < 60) return `in ${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `in ${hrs}h`;
  const days = Math.round(hrs / 24);
  return `in ${days}d`;
}
