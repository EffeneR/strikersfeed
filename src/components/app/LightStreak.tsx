import { cn } from "@/lib/cn";

/**
 * The brand's signature neon light-streak — a decorative glowing curve used
 * behind app-promo heroes. Pure inline SVG (no external asset), theme-agnostic,
 * and non-interactive.
 */
export function LightStreak({ className }: { className?: string }) {
  const id = "ls";
  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      viewBox="0 0 600 400"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`${id}-grad`} x1="0" y1="400" x2="600" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#b6ff2e" stopOpacity="0" />
          <stop offset="0.45" stopColor="#b6ff2e" />
          <stop offset="1" stopColor="#eaffb0" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>
      {/* soft wide glow */}
      <path
        d="M-60 320 C 180 400, 300 120, 660 30"
        stroke={`url(#${id}-grad)`}
        strokeWidth="26"
        strokeLinecap="round"
        filter={`url(#${id}-glow)`}
        opacity="0.45"
      />
      {/* bright core */}
      <path
        d="M-60 320 C 180 400, 300 120, 660 30"
        stroke={`url(#${id}-grad)`}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* trailing strand */}
      <path
        d="M-60 350 C 200 410, 330 160, 660 60"
        stroke="#b6ff2e"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
