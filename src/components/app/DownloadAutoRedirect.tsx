"use client";

import { useEffect } from "react";

/**
 * On a phone, sends the visitor straight to the right (server-validated)
 * destination; on desktop it does nothing so the page's manual choices show.
 * All URLs are pre-validated server-side, so there's no open-redirect surface.
 */
export function DownloadAutoRedirect({
  ios,
  android,
}: {
  ios: string | null;
  android: string | null;
}) {
  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    if (isIOS) {
      window.location.replace(ios ?? "/app");
    } else if (isAndroid) {
      window.location.replace(android ?? "/app");
    }
    // Desktop: intentionally no redirect.
  }, [ios, android]);

  return null;
}
