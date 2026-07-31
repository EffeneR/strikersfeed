/** Formatting helpers for counts, timestamps and date ranges. */

/** Compact number formatting: 942 → "942", 1234 → "1.2K", 2_400_000 → "2.4M". */
export function formatCount(value: number): string {
  if (value < 1000) return String(value);
  if (value < 1_000_000) {
    const k = value / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  const m = value / 1_000_000;
  return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
}

/**
 * Short relative time, X-style: "15m", "2h", "3d", or an absolute date beyond
 * a week. Deterministic given `now`, which defaults to the current time.
 */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  const diffMs = now.getTime() - then;
  if (Number.isNaN(then)) return "";
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  if (sec < 5) return "now";
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "May 24 – Jun 1" style range for tournament cards. */
export function formatDateRange(startIso: string, endIso: string): string {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const sLabel = `${MONTHS[s.getMonth()]} ${s.getDate()}`;
  const eLabel =
    s.getMonth() === e.getMonth()
      ? `${e.getDate()}`
      : `${MONTHS[e.getMonth()]} ${e.getDate()}`;
  return `${sLabel} – ${eLabel}`;
}

/** Single readable date, e.g. "May 24, 2026". */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "3:45" style label from seconds. */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
