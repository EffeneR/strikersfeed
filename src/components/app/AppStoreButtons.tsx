import Link from "next/link";
import { Apple, Bell, Smartphone } from "lucide-react";
import { MOBILE_APP_STATUS, storeCtas, type MobileAppStatus } from "@/config/mobileApp";
import { cn } from "@/lib/cn";

const SUPPORT_EMAIL = "hello@strikersfeed.club";

/**
 * Store CTA buttons that adapt to the release state. Buttons route to /download
 * (which resolves the correct per-device destination) so marketing assets never
 * hard-link to a store URL that might change.
 */
export function AppStoreButtons({
  status = MOBILE_APP_STATUS,
  className,
}: {
  status?: MobileAppStatus;
  className?: string;
}) {
  const cta = storeCtas(status);

  if (status === "COMING_SOON") {
    return (
      <div className={cn("flex flex-col items-start gap-2", className)}>
        <a
          href={`mailto:${SUPPORT_EMAIL}?subject=Notify%20me%20about%20the%20StrikersFeed%20app`}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-black transition-colors hover:bg-accent-hover"
        >
          <Bell className="h-4 w-4" /> Notify me
        </a>
        <p className="text-xs text-ink-muted">Mobile apps coming soon.</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      <StoreButton href="/download" icon={<Apple className="h-5 w-5" />} label={cta.ios} />
      <StoreButton
        href="/download"
        icon={<Smartphone className="h-5 w-5" />}
        label={cta.android}
      />
    </div>
  );
}

function StoreButton({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-12 items-center gap-3 rounded-xl border border-line bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:bg-surface-hover"
    >
      <span className="text-accent">{icon}</span>
      {label}
    </Link>
  );
}
