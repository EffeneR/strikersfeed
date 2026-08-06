import Link from "next/link";
import { ArrowRight, Bell, Clapperboard, MessagesSquare, Trophy } from "lucide-react";
import { AppAvailabilityBadge } from "./AppAvailabilityBadge";
import { AppStoreButtons } from "./AppStoreButtons";
import { AppDownloadQRCode } from "./AppDownloadQRCode";
import { LightStreak } from "./LightStreak";
import { HeroPhones } from "./PhoneShowcase";

const CHIPS = [
  { icon: Bell, label: "Live match alerts" },
  { icon: Clapperboard, label: "Clip & highlights" },
  { icon: MessagesSquare, label: "Community chat" },
  { icon: Trophy, label: "Tournaments" },
];

/** Homepage "app in your pocket" promo band. */
export function AppPromotionSection() {
  return (
    <section className="relative overflow-hidden border-t border-line bg-background-secondary">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(110%_120%_at_10%_40%,rgba(182,255,46,0.09),transparent_55%)]" />
        <LightStreak className="opacity-40" />
      </div>

      <div className="container-shell relative grid items-center gap-10 py-14 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
              New
            </span>
            <AppAvailabilityBadge />
          </div>

          <h2 className="font-condensed text-3xl font-bold tracking-wide text-ink lg:text-5xl">
            StrikersFeed in <span className="text-accent">your pocket</span>
          </h2>
          <p className="mt-3 max-w-lg text-base text-ink-muted">
            Never miss a moment. Follow matches, join conversations and connect with
            the Strikers community — anytime, anywhere.
          </p>

          <ul className="mt-6 flex flex-wrap gap-2.5">
            {CHIPS.map((c) => {
              const Icon = c.icon;
              return (
                <li
                  key={c.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/60 px-3 py-1.5 text-xs font-medium text-ink"
                >
                  <Icon className="h-3.5 w-3.5 text-accent" /> {c.label}
                </li>
              );
            })}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <AppStoreButtons />
            <div className="hidden items-center gap-3 rounded-2xl border border-line bg-surface/60 p-3 sm:flex">
              <AppDownloadQRCode size={92} className="!p-2" />
              <span className="max-w-[6rem] text-xs font-medium text-ink-muted">Scan to download</span>
            </div>
          </div>

          <Link
            href="/app"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
          >
            Explore the app <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="hidden lg:flex lg:justify-end">
          <HeroPhones />
        </div>
      </div>
    </section>
  );
}
