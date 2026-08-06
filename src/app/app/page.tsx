import type { Metadata } from "next";
import {
  Apple,
  Bell,
  Check,
  ChevronDown,
  Clapperboard,
  MessagesSquare,
  Rocket,
  ShieldCheck,
  Smartphone,
  Trophy,
  Users,
} from "lucide-react";
import { MOBILE_APP_STATUS } from "@/config/mobileApp";
import { Footer } from "@/components/layout/Footer";
import { AppAvailabilityBadge } from "@/components/app/AppAvailabilityBadge";
import { AppStoreButtons } from "@/components/app/AppStoreButtons";
import { AppDownloadQRCode } from "@/components/app/AppDownloadQRCode";
import { LightStreak } from "@/components/app/LightStreak";
import { HeroPhones, ScreenshotStrip } from "@/components/app/PhoneShowcase";

export const metadata: Metadata = {
  title: "The StrikersFeed App",
  description:
    "Follow matches, post clips and join the discussion on the StrikersFeed mobile app for iOS and Android.",
};

const HERO_CHIPS = ["Live match alerts", "Clip & highlights", "Community chat", "Tournaments"];

const FEATURES = [
  { icon: Bell, title: "Instant match alerts", body: "Real-time goal, lineup and result notifications." },
  { icon: Clapperboard, title: "Upload clips anywhere", body: "Capture the moment and share it in seconds." },
  { icon: Users, title: "Follow teams and players", body: "Personalise your feed with your favourites." },
  { icon: MessagesSquare, title: "Join every discussion", body: "Chat with fans, react to plays, share your take." },
];

const MORE_FEATURES = [
  { icon: Trophy, title: "Matches & tournaments", body: "Fixtures, live scores and community brackets on the go." },
  { icon: ShieldCheck, title: "Safe & moderated", body: "In-app report & block tools plus Steam-verified identity." },
  { icon: MessagesSquare, title: "One account, everywhere", body: "The same StrikersFeed profile across web and mobile." },
];

const IOS_SPECS = ["iOS 15 or later", "iPhone 8 and above", "Optimised for iPhone"];
const ANDROID_SPECS = ["Android 8.0 or later", "2GB RAM or above", "Optimised for Android"];

const FAQ = [
  { q: "Is StrikersFeed free to download?", a: "Yes — the app is free to download and use on both iOS and Android." },
  { q: "Which devices are supported?", a: "iPhone on iOS 15+ and Android phones on Android 8.0+." },
  { q: "Is it the same account as the website?", a: "Yes. One StrikersFeed account works across web and mobile via the shared backend." },
  { q: "How do I enable notifications?", a: "Allow notifications when prompted, then fine-tune match and mention alerts in Settings." },
  { q: "Can I post clips from my phone?", a: "Yes — images upload straight from the app today, with native video landing next." },
];

function ctaHeadline(): string {
  if (MOBILE_APP_STATUS === "LIVE") return "Now available on iOS and Android";
  if (MOBILE_APP_STATUS === "BETA") return "Now in beta on iOS and Android";
  return "Launching soon on iOS and Android";
}

export default function AppLandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(130%_90%_at_85%_-10%,rgba(182,255,46,0.12),transparent_55%)]" />
          <LightStreak className="opacity-70" />
        </div>
        <div className="container-shell relative grid items-center gap-12 py-16 lg:grid-cols-[1fr_1.05fr] lg:py-24">
          <div>
            <AppAvailabilityBadge className="mb-5" />
            <h1 className="font-condensed text-5xl font-extrabold leading-[0.92] tracking-wide text-ink sm:text-6xl">
              Take StrikersFeed <span className="text-accent">everywhere.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-ink-muted">
              Follow matches, post clips, join discussions and get instant alerts —
              on iOS and Android.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <AppStoreButtons />
              <div className="hidden items-center gap-3 rounded-2xl border border-line bg-surface/60 p-3 sm:flex">
                <AppDownloadQRCode size={96} className="!p-2" />
                <span className="max-w-[6rem] text-xs font-medium text-ink-muted">
                  Scan to download
                </span>
              </div>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
              {HERO_CHIPS.map((c) => (
                <li key={c} className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {c}
                </li>
              ))}
            </ul>
          </div>
          <HeroPhones className="lg:justify-self-end" />
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-b border-line bg-background-secondary">
        <div className="container-shell grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-accent ring-1 ring-inset ring-line">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-ink">{f.title}</h2>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{f.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Screenshots */}
      <section className="container-shell py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-condensed text-3xl font-bold tracking-wide text-ink">
              See the app in action
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              A fast, dark, made-for-matchday experience.
            </p>
          </div>
        </div>
        <ScreenshotStrip />
      </section>

      {/* Spec cards */}
      <section className="container-shell grid gap-6 pb-14 md:grid-cols-2">
        <SpecCard
          icon={<Apple className="h-6 w-6" />}
          title="Available on iPhone"
          specs={IOS_SPECS}
        />
        <SpecCard
          icon={<Smartphone className="h-6 w-6" />}
          title="Available on Android"
          specs={ANDROID_SPECS}
        />
      </section>

      {/* Extra features */}
      <section className="container-shell grid gap-4 pb-14 sm:grid-cols-3">
        {MORE_FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="rounded-2xl border border-line bg-surface/50 p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-background text-accent ring-1 ring-inset ring-line">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-ink">{f.title}</h3>
              <p className="mt-1 text-sm text-ink-muted">{f.body}</p>
            </div>
          );
        })}
      </section>

      {/* CTA band */}
      <section className="border-y border-line bg-background-secondary">
        <div className="container-shell relative overflow-hidden py-14">
          <LightStreak className="opacity-25" />
          <div className="relative mx-auto flex max-w-xl flex-col items-center gap-5 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-inset ring-accent/30">
              <Rocket className="h-6 w-6" />
            </span>
            <h2 className="font-condensed text-3xl font-bold tracking-wide text-ink lg:text-4xl">
              {ctaHeadline()}
            </h2>
            <p className="max-w-md text-sm text-ink-muted">
              Never miss a moment. Download StrikersFeed and take the whole
              community with you — anytime, anywhere.
            </p>
            <AppStoreButtons className="justify-center" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-shell py-14">
        <h2 className="mb-5 font-condensed text-3xl font-bold tracking-wide text-ink">
          Frequently asked questions
        </h2>
        <div className="mx-auto max-w-3xl space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-line bg-surface/50 px-4 py-3 open:bg-surface"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink">
                {item.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-sm text-ink-muted">{item.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-ink-muted">
          {MOBILE_APP_STATUS === "COMING_SOON"
            ? "The mobile app is in active development — tap “Notify me” to hear the moment it launches."
            : "Device support: iPhone (iOS 15+) and Android (8+)."}
        </p>
      </section>

      <Footer />
    </>
  );
}

function SpecCard({
  icon,
  title,
  specs,
}: {
  icon: React.ReactNode;
  title: string;
  specs: string[];
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface/50 p-6">
      <div className="flex items-center gap-3">
        <span className="text-accent">{icon}</span>
        <h3 className="font-condensed text-xl font-bold tracking-wide text-ink">{title}</h3>
      </div>
      <ul className="mt-4 space-y-2">
        {specs.map((s) => (
          <li key={s} className="flex items-center gap-2 text-sm text-ink-muted">
            <Check className="h-4 w-4 shrink-0 text-accent" /> {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
