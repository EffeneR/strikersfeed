import { cn } from "@/lib/cn";

/**
 * Original, brand-styled football-pitch artwork rendered as inline SVG.
 * Used as a placeholder for gameplay clips / media / review covers so Phase 1
 * needs no external images and no copyrighted real footage. Deterministic from
 * `seed`, so a given post always looks the same (server === client render).
 */

function seededRandom(seedStr: string): () => number {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i += 1) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let state = h >>> 0;
  return () => {
    state = (Math.imul(state ^ (state >>> 15), 1 | state) + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function PitchArt({
  seed = "strikersfeed",
  className,
}: {
  seed?: string;
  className?: string;
}) {
  const rand = seededRandom(seed);
  const uid = `pa-${Math.floor(rand() * 1e9).toString(36)}`;
  const line = "rgba(244,247,242,0.14)";

  // A few seeded "players" (lime = attackers, grey = defenders) + a ball.
  const dots = Array.from({ length: 5 }, (_, i) => ({
    x: 28 + rand() * 264,
    y: 26 + rand() * 128,
    lime: i < 2,
  }));
  const ball = { x: 60 + rand() * 200, y: 40 + rand() * 100 };

  return (
    <svg
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-full w-full", className)}
      role="img"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${uid}-bg`} cx="50%" cy="32%" r="90%">
          <stop offset="0%" stopColor="#18201a" />
          <stop offset="55%" stopColor="#0e130f" />
          <stop offset="100%" stopColor="#070907" />
        </radialGradient>
        <linearGradient id={`${uid}-vig`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      <rect width="320" height="180" fill={`url(#${uid}-bg)`} />

      {/* mowing stripes */}
      {Array.from({ length: 8 }).map((_, i) => (
        <rect
          key={i}
          x={i * 40}
          y="0"
          width="40"
          height="180"
          fill="#ffffff"
          opacity={i % 2 === 0 ? 0.015 : 0}
        />
      ))}

      {/* pitch markings */}
      <g stroke={line} strokeWidth="1.1" fill="none">
        <rect x="14" y="16" width="292" height="148" rx="2" />
        <line x1="160" y1="16" x2="160" y2="164" />
        <circle cx="160" cy="90" r="26" />
        <circle cx="160" cy="90" r="1.6" fill={line} stroke="none" />
        <rect x="14" y="52" width="42" height="76" />
        <rect x="264" y="52" width="42" height="76" />
        <rect x="14" y="70" width="16" height="40" />
        <rect x="290" y="70" width="16" height="40" />
      </g>

      {/* seeded players */}
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.x}
          cy={d.y}
          r="3"
          fill={d.lime ? "var(--accent)" : "#c7cec4"}
          opacity={d.lime ? 0.9 : 0.55}
        />
      ))}

      {/* ball */}
      <circle cx={ball.x} cy={ball.y} r="2.2" fill="#ffffff" opacity="0.95" />

      <rect width="320" height="180" fill={`url(#${uid}-vig)`} />
    </svg>
  );
}
