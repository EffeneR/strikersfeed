import type { Metadata } from "next";
import {
  Bell,
  Clapperboard,
  MessagesSquare,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import { MOBILE_APP_STATUS } from "@/config/mobileApp";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { AppAvailabilityBadge } from "@/components/app/AppAvailabilityBadge";
import { AppStoreButtons } from "@/components/app/AppStoreButtons";
import { AppDownloadQRCode } from "@/components/app/AppDownloadQRCode";
import { PhoneFeedMockup } from "@/components/app/PhoneFeedMockup";

export const metadata: Metadata = {
  title: "The StrikersFeed App",
  description:
    "Follow matches, post clips and join the discussion on the StrikersFeed mobile app for iOS and Android.",
};

const FEATURES = [
  { icon: MessagesSquare, title: "The feed, everywhere", body: "For You, Following, Clips and Match Threads — with pull-to-refresh." },
  { icon: Clapperboard, title: "Upload clips anywhere", body: "Post images and short native videos straight from your phone." },
  { icon: Bell, title: "Match alerts", body: "Get notified when matches start, results land, or you're mentioned." },
  { icon: Users, title: "Follow players & teams", body: "Keep up with your favourite rosters and the community's best." },
  { icon: Trophy, title: "Matches & tournaments", body: "Browse fixtures, results and community tournaments on the go." },
  { icon: ShieldCheck, title: "Safe & moderated", body: "Report and block tools, plus Steam-verified identity." },
];

const FAQ = [
  { q: "Which devices are supported?", a: "iPhone on iOS 15+ and Android phones on Android 8+." },
  { q: "Is it the same account as the website?", a: "Yes — one StrikersFeed account works across web and mobile via the shared backend." },
  { q: "Does it cost anything?", a: "No, the app is free to download and use." },
  { q: "Can I post clips from my phone?", a: "Yes — images and short native videos upload directly from the app." },
];

export default function AppLandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-line">
        <div className="container-shell grid items-center gap-10 py-16 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <AppAvailabilityBadge className="mb-4" />
            <h1 className="font-condensed text-4xl font-extrabold leading-[1.05] tracking-wide text-ink sm:text-5xl">
              StrikersFeed in your pocket
            </h1>
            <p className="mt-4 max-w-lg text-lg text-ink-muted">
              Follow matches, post clips and join the discussion wherever you play.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <AppStoreButtons />
              <div className="hidden sm:block">
                <AppDownloadQRCode size={140} />
              </div>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <PhoneFeedMockup />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container-shell py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-accent ring-1 ring-inset ring-line">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-sm font-semibold text-ink">{f.title}</h2>
                <p className="mt-1 text-sm text-ink-muted">{f.body}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="container-shell pb-14">
        <h2 className="mb-5 font-condensed text-2xl font-bold tracking-wide text-ink">
          Frequently asked
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {FAQ.map((item) => (
            <Card key={item.q} className="p-5">
              <p className="text-sm font-semibold text-ink">{item.q}</p>
              <p className="mt-1 text-sm text-ink-muted">{item.a}</p>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-xs text-ink-muted">
          {MOBILE_APP_STATUS === "COMING_SOON"
            ? "The mobile app is in active development — tap “Notify me” to hear when it launches."
            : "Device support: iPhone (iOS 15+) and Android (8+)."}
        </p>
      </section>

      <Footer />
    </>
  );
}
