"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { MOBILE_APP_STATUS, storeCtas } from "@/config/mobileApp";

const DISMISS_KEY = "strikersfeed.app-banner-dismissed";

/**
 * A single, dismissible "get the app" banner. Deliberately restrained — it never
 * reappears once dismissed and is never a full-screen interstitial.
 */
export function MobileAppBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      setShow(window.localStorage.getItem(DISMISS_KEY) !== "1");
    } catch {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  const cta =
    MOBILE_APP_STATUS === "COMING_SOON"
      ? "Mobile app coming soon"
      : `${storeCtas().badgeLabel} — get the app`;

  return (
    <div className="border-b border-line bg-background-secondary">
      <div className="container-shell flex items-center justify-between gap-3 py-2 text-sm">
        <span className="truncate text-ink-muted">
          <span className="font-semibold text-ink">StrikersFeed</span> {cta}
        </span>
        <div className="flex items-center gap-2">
          <Link
            href="/app"
            className="shrink-0 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-black transition-colors hover:bg-accent-hover"
          >
            Learn more
          </Link>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={dismiss}
            className="flex h-6 w-6 items-center justify-center rounded-full text-ink-muted hover:bg-surface-hover hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
