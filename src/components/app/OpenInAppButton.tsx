import { ArrowUpRight } from "lucide-react";
import { MOBILE_APP_STATUS, SITE_URL } from "@/config/mobileApp";
import { cn } from "@/lib/cn";

/**
 * Restrained "Open in StrikersFeed" link. Points at the canonical HTTPS URL so
 * that, when the app is installed and the domain is associated (Universal Links
 * / Android App Links), the OS opens the app — otherwise it stays on the web.
 * Hidden until the app is at least in beta.
 */
export function OpenInAppButton({
  path,
  className,
}: {
  /** Canonical path for this content, e.g. `/matches/abc`. */
  path: string;
  className?: string;
}) {
  if (MOBILE_APP_STATUS === "COMING_SOON") return null;
  const href = `${SITE_URL.replace(/\/$/, "")}${path}`;
  return (
    <a
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-ink",
        className,
      )}
    >
      Open in StrikersFeed
      <ArrowUpRight className="h-3.5 w-3.5" />
    </a>
  );
}
