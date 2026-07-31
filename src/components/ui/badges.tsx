import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/cn";

/** Blue-style verification tick, tinted to the brand accent. */
export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <BadgeCheck
      aria-label="Verified account"
      className={cn("h-4 w-4 text-accent", className)}
    />
  );
}

/** Small "Pro" tag shown next to Pro accounts. */
export function ProBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-px text-[10px] font-bold uppercase tracking-wide text-accent ring-1 ring-inset ring-accent/40",
        className,
      )}
    >
      Pro
    </span>
  );
}

/** Pulsing LIVE indicator used on match cards. */
export function LiveBadge({
  label = "Live",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-live",
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-live opacity-75 motion-safe:animate-pulse-live" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-live" />
      </span>
      {label}
    </span>
  );
}

/** Neutral pill for statuses/tags. */
export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "live";
  className?: string;
}) {
  const tones = {
    neutral: "bg-surface text-ink-muted ring-1 ring-inset ring-line",
    accent: "bg-accent/10 text-accent ring-1 ring-inset ring-accent/30",
    live: "bg-live/10 text-live ring-1 ring-inset ring-live/30",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
