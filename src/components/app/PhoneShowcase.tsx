import type { ReactNode } from "react";
import {
  BatteryFull,
  Heart,
  Home,
  MessageCircle,
  Play,
  Plus,
  Rss,
  ScanLine,
  Signal,
  Swords,
  User,
  Wifi,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { PitchArt } from "@/components/ui/PitchArt";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ *
 * Shared chrome
 * ------------------------------------------------------------------ */

function StatusBar({ dark = false }: { dark?: boolean }) {
  const tone = dark ? "text-white" : "text-ink";
  return (
    <div className={cn("flex items-center justify-between px-5 pb-1 pt-2.5 text-[9px] font-semibold", tone)}>
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <Signal className="h-2.5 w-2.5" />
        <Wifi className="h-2.5 w-2.5" />
        <BatteryFull className="h-3 w-3" />
      </div>
    </div>
  );
}

function MiniCrest({ initials, tone = "accent" }: { initials: string; tone?: "accent" | "blue" | "violet" }) {
  const bg =
    tone === "blue"
      ? "bg-[#1e2a4a] text-[#8fb3ff]"
      : tone === "violet"
        ? "bg-[#2a1e4a] text-[#c4a8ff]"
        : "bg-accent/15 text-accent";
  return (
    <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold ring-1 ring-inset ring-white/10", bg)}>
      {initials}
    </span>
  );
}

function BottomBar({ active = "home" }: { active?: "home" | "matches" | "feed" | "profile" }) {
  const item = (key: string, Icon: typeof Home) => (
    <Icon
      className={cn("h-[18px] w-[18px]", active === key ? "text-accent" : "text-ink-muted")}
      fill={active === key && key === "home" ? "currentColor" : "none"}
    />
  );
  return (
    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-line bg-background/95 px-6 pb-4 pt-2.5 backdrop-blur">
      {item("home", Home)}
      {item("matches", Swords)}
      <span className="flex h-9 w-9 -translate-y-1 items-center justify-center rounded-full bg-accent shadow-[0_0_18px_-2px_rgba(182,255,46,0.7)]">
        <Plus className="h-5 w-5 text-black" strokeWidth={2.5} />
      </span>
      {item("feed", Rss)}
      {item("profile", User)}
    </div>
  );
}

function Tabs({ items, active }: { items: string[]; active: number }) {
  return (
    <div className="flex items-center gap-4 px-4 pb-2.5 pt-0.5 text-[11px] font-semibold">
      {items.map((t, i) => (
        <span key={t} className={cn("relative pb-1", i === active ? "text-ink" : "text-ink-muted")}>
          {t}
          {i === active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent" />}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Screens
 * ------------------------------------------------------------------ */

/** Black splash with the wordmark + neon streak. */
export function ScreenSplash() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center bg-[#070907]">
      <StatusBar dark />
      {/* streak */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 240 510" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="sp-g" x1="0" y1="510" x2="240" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#b6ff2e" stopOpacity="0" />
            <stop offset="0.6" stopColor="#b6ff2e" />
            <stop offset="1" stopColor="#eaffb0" />
          </linearGradient>
          <filter id="sp-b" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>
        <path d="M-20 470 C 120 520, 90 300, 260 210" stroke="url(#sp-g)" strokeWidth="16" strokeLinecap="round" filter="url(#sp-b)" opacity="0.5" />
        <path d="M-20 470 C 120 520, 90 300, 260 210" stroke="url(#sp-g)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <div className="relative flex flex-1 items-center justify-center">
        <Logo height={26} showDomain={false} href={null} />
      </div>
    </div>
  );
}

/** The hero "money shot": live match + top feed. */
export function ScreenLive() {
  return (
    <div className="relative h-full bg-background">
      <StatusBar />
      <div className="flex items-center justify-between px-4 pb-1.5">
        <span className="font-condensed text-lg font-bold tracking-wide text-ink">Live</span>
        <ScanLine className="h-4 w-4 text-ink-muted" />
      </div>
      <Tabs items={["Following", "All", "Trending"]} active={0} />

      {/* Live score card */}
      <div className="mx-3 rounded-xl border border-line bg-surface p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[9px] font-semibold uppercase tracking-wide text-ink-muted">Elite Cup</span>
          <span className="flex items-center gap-1 rounded-full bg-live/15 px-1.5 py-0.5 text-[8px] font-bold text-live">
            <span className="h-1 w-1 rounded-full bg-live" /> LIVE
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center gap-1">
            <MiniCrest initials="SU" tone="blue" />
            <span className="text-[9px] text-ink-muted">Strikers Utd</span>
          </div>
          <div className="text-center">
            <div className="font-condensed text-xl font-bold text-ink">2 - 1</div>
            <div className="text-[9px] font-semibold text-accent">79&apos;</div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <MiniCrest initials="VX" tone="violet" />
            <span className="text-[9px] text-ink-muted">Vortex FC</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 pb-1 pt-3">
        <span className="text-[11px] font-bold text-ink">Top Feed</span>
        <span className="rounded-md border border-line px-1.5 py-0.5 text-[8px] text-ink-muted">Latest ▾</span>
      </div>

      <div className="px-3">
        <FeedRow initials="SU" title="Goal alert!" body="Strikers United take the lead!" seed="hero-1" likes={16} comments={24} />
        <FeedRow initials="VX" title="Big save" body="Unbelievable stop from the keeper!" seed="hero-2" likes={9} comments={12} />
        <FeedRow initials="PH" title="What a strike!" body="Phoenix from outside the box ⚽" seed="hero-3" likes={20} comments={8} />
      </div>

      <BottomBar active="home" />
    </div>
  );
}

function FeedRow({
  initials,
  title,
  body,
  seed,
  likes,
  comments,
}: {
  initials: string;
  title: string;
  body: string;
  seed: string;
  likes: number;
  comments: number;
}) {
  return (
    <div className="flex items-center gap-2.5 border-b border-line py-2">
      <MiniCrest initials={initials} tone="blue" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold text-ink">{title}</p>
        <p className="truncate text-[10px] text-ink-muted">{body}</p>
        <div className="mt-0.5 flex items-center gap-3 text-ink-muted">
          <span className="flex items-center gap-0.5 text-[8px]">
            <Heart className="h-2.5 w-2.5" /> {likes}
          </span>
          <span className="flex items-center gap-0.5 text-[8px]">
            <MessageCircle className="h-2.5 w-2.5" /> {comments}
          </span>
        </div>
      </div>
      <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-md border border-line">
        <PitchArt seed={seed} />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black/50">
            <Play className="h-2 w-2 fill-white text-white" />
          </span>
        </span>
      </div>
    </div>
  );
}

/** Compact matches list. */
export function ScreenMatches() {
  const rows = [
    { a: "SU", b: "VX", an: "Strikers Utd", bn: "Vortex FC", s: "2 - 1", live: true, min: "79'" },
    { a: "PH", b: "NG", an: "Phoenix FC", bn: "Next Gen", s: "1 - 1", live: true, min: "63'" },
    { a: "RD", b: "HP", an: "Raiders", bn: "High Press", s: "17:30", live: false, min: "Today" },
  ];
  return (
    <div className="relative h-full bg-background">
      <StatusBar />
      <div className="px-4 pb-1.5 font-condensed text-lg font-bold tracking-wide text-ink">Matches</div>
      <Tabs items={["Live", "Upcoming", "Results"]} active={0} />
      <div className="space-y-2 px-3">
        {rows.map((r) => (
          <div key={r.an} className="flex items-center justify-between rounded-xl border border-line bg-surface px-3 py-2.5">
            <div className="flex items-center gap-2">
              <MiniCrest initials={r.a} tone="blue" />
              <span className="text-[10px] text-ink">{r.an}</span>
            </div>
            <div className="text-center">
              <div className="font-condensed text-sm font-bold text-ink">{r.s}</div>
              <div className={cn("text-[8px] font-semibold", r.live ? "text-live" : "text-ink-muted")}>
                {r.live ? `● ${r.min}` : r.min}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-ink">{r.bn}</span>
              <MiniCrest initials={r.b} tone="violet" />
            </div>
          </div>
        ))}
      </div>
      <BottomBar active="matches" />
    </div>
  );
}

/** Clips grid. */
export function ScreenClips() {
  const seeds = ["c1", "c2", "c3", "c4", "c5", "c6"];
  return (
    <div className="relative h-full bg-background">
      <StatusBar />
      <div className="px-4 pb-1.5 font-condensed text-lg font-bold tracking-wide text-ink">Clips</div>
      <Tabs items={["Top", "Recent", "Following"]} active={0} />
      <div className="grid grid-cols-2 gap-2 px-3">
        {seeds.map((s) => (
          <div key={s} className="relative aspect-[9/12] overflow-hidden rounded-lg border border-line">
            <PitchArt seed={s} />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/50">
                <Play className="h-2.5 w-2.5 fill-white text-white" />
              </span>
            </span>
          </div>
        ))}
      </div>
      <BottomBar active="feed" />
    </div>
  );
}

/** Profile screen. */
export function ScreenProfile() {
  return (
    <div className="relative h-full bg-background">
      <StatusBar />
      <div className="h-16 bg-gradient-to-r from-accent/25 to-surface" />
      <div className="-mt-7 px-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-background bg-accent/20 text-base font-bold text-accent">
          AR
        </span>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-sm font-bold text-ink">ArmanPlayz</span>
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[7px] font-bold text-black">✓</span>
        </div>
        <span className="text-[10px] text-ink-muted">@armanplayz</span>
        <p className="mt-2 text-[10px] text-ink-muted">Ranked grinder. Elite Division. Clips daily.</p>
        <div className="mt-3 flex gap-5 text-[10px]">
          <span className="text-ink"><b className="text-ink">128</b> <span className="text-ink-muted">Posts</span></span>
          <span className="text-ink"><b className="text-ink">1.2K</b> <span className="text-ink-muted">Followers</span></span>
          <span className="text-ink"><b className="text-ink">320</b> <span className="text-ink-muted">Following</span></span>
        </div>
        <div className="mt-3 flex gap-2">
          <span className="flex-1 rounded-full bg-accent py-1.5 text-center text-[10px] font-semibold text-black">Follow</span>
          <span className="flex-1 rounded-full border border-line py-1.5 text-center text-[10px] font-semibold text-ink">Message</span>
        </div>
      </div>
      <div className="mt-3 px-3">
        <FeedRow initials="AR" title="Big W in the Elite Division 💪" body="Ranked grind doesn't stop." seed="pf-1" likes={142} comments={24} />
      </div>
      <BottomBar active="profile" />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Frame + layouts
 * ------------------------------------------------------------------ */

export function PhoneFrame({
  children,
  className,
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative w-[248px] shrink-0 rounded-[2.4rem] border-[7px] border-[#15181a] bg-[#0a0c0a]",
        glow ? "shadow-[0_0_70px_-14px_rgba(182,255,46,0.5)]" : "shadow-2xl",
        className,
      )}
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-0 z-20 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-[#15181a]" />
      <div className="relative h-[510px] overflow-hidden rounded-[1.9rem] bg-background">{children}</div>
    </div>
  );
}

/** Two overlapping hero phones: splash behind, live feed in front. */
export function HeroPhones({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center", className)} aria-hidden="true">
      <div className="hidden translate-x-6 rotate-[-6deg] sm:block">
        <PhoneFrame className="scale-90 opacity-95">
          <ScreenSplash />
        </PhoneFrame>
      </div>
      <div className="sm:-ml-24 sm:translate-y-4 sm:rotate-[4deg]">
        <PhoneFrame glow>
          <ScreenLive />
        </PhoneFrame>
      </div>
    </div>
  );
}

/** A phone rendered at a reduced size for the screenshots strip. */
function ScaledPhone({ children }: { children: ReactNode }) {
  return (
    <div className="h-[340px] w-[166px] shrink-0 overflow-hidden">
      <div className="origin-top-left scale-[0.66]">
        <PhoneFrame>{children}</PhoneFrame>
      </div>
    </div>
  );
}

/** Horizontal "see the app in action" strip. */
export function ScreenshotStrip() {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-4">
        <ScaledPhone><ScreenMatches /></ScaledPhone>
        <ScaledPhone><ScreenLive /></ScaledPhone>
        <ScaledPhone><ScreenClips /></ScaledPhone>
        <ScaledPhone><ScreenProfile /></ScaledPhone>
        <ScaledPhone><ScreenSplash /></ScaledPhone>
      </div>
    </div>
  );
}
