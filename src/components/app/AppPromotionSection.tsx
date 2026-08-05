import { Bell, Clapperboard, MessagesSquare, Users } from "lucide-react";
import { AppAvailabilityBadge } from "./AppAvailabilityBadge";
import { AppStoreButtons } from "./AppStoreButtons";
import { AppDownloadQRCode } from "./AppDownloadQRCode";
import { PhoneFeedMockup } from "./PhoneFeedMockup";

const FEATURES = [
  { icon: Bell, label: "Instant match alerts" },
  { icon: Clapperboard, label: "Upload clips anywhere" },
  { icon: Users, label: "Follow players and teams" },
  { icon: MessagesSquare, label: "Join every match discussion" },
];

/** Homepage "app in your pocket" section. */
export function AppPromotionSection() {
  return (
    <section className="border-t border-line bg-background-secondary">
      <div className="container-shell grid items-center gap-10 py-14 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <AppAvailabilityBadge className="mb-4" />
          <h2 className="font-condensed text-3xl font-bold tracking-wide text-ink lg:text-4xl">
            StrikersFeed in your pocket
          </h2>
          <p className="mt-3 max-w-lg text-base text-ink-muted">
            Follow matches, post clips and join the discussion wherever you play.
          </p>

          <ul className="mt-6 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.label} className="flex items-center gap-2.5 text-sm text-ink">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-accent ring-1 ring-inset ring-line">
                    <Icon className="h-4 w-4" />
                  </span>
                  {f.label}
                </li>
              );
            })}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-6">
            <AppStoreButtons />
            <div className="hidden sm:block">
              <AppDownloadQRCode size={128} />
            </div>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <PhoneFeedMockup />
        </div>
      </div>
    </section>
  );
}
