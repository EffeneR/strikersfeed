import { MOBILE_APP_STATUS, storeCtas, type MobileAppStatus } from "@/config/mobileApp";
import { cn } from "@/lib/cn";

/** Small pill reflecting the current mobile release state. */
export function AppAvailabilityBadge({
  status = MOBILE_APP_STATUS,
  className,
}: {
  status?: MobileAppStatus;
  className?: string;
}) {
  const label = storeCtas(status).badgeLabel;
  const tone =
    status === "LIVE"
      ? "bg-accent/10 text-accent ring-accent/30"
      : status === "BETA"
        ? "bg-accent/10 text-accent ring-accent/30"
        : "bg-surface text-ink-muted ring-line";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset",
        tone,
        className,
      )}
    >
      {status !== "COMING_SOON" && (
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      )}
      {label}
    </span>
  );
}
