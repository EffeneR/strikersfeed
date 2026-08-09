/**
 * Mobile-app release state + store destinations.
 *
 * Everything is driven by public env vars so marketing/CTA state can change per
 * environment without code changes. External URLs are validated against an
 * allowlist of known store/beta hosts so a misconfiguration can never become an
 * open redirect.
 */

export type MobileAppStatus = "COMING_SOON" | "BETA" | "LIVE";

function readStatus(): MobileAppStatus {
  const raw = process.env.NEXT_PUBLIC_MOBILE_APP_STATUS;
  if (raw === "BETA" || raw === "LIVE") return raw;
  return "COMING_SOON";
}

export const MOBILE_APP_STATUS: MobileAppStatus = readStatus();

/** Hosts we allow store/beta destinations to point at. */
const ALLOWED_STORE_HOSTS = new Set([
  "apps.apple.com",
  "itunes.apple.com",
  "testflight.apple.com",
  "play.google.com",
]);

/** Returns the URL only if it's a valid https link on an allowed store host. */
export function safeStoreUrl(raw: string | undefined | null): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    if (!ALLOWED_STORE_HOSTS.has(url.hostname.toLowerCase())) return null;
    return url.toString();
  } catch {
    return null;
  }
}

const IOS_APP_URL = safeStoreUrl(process.env.NEXT_PUBLIC_IOS_APP_URL);
const ANDROID_APP_URL = safeStoreUrl(process.env.NEXT_PUBLIC_ANDROID_APP_URL);
const TESTFLIGHT_URL = safeStoreUrl(process.env.NEXT_PUBLIC_TESTFLIGHT_URL);
const ANDROID_BETA_URL = safeStoreUrl(process.env.NEXT_PUBLIC_ANDROID_BETA_URL);

/**
 * Direct Android APK (EAS build). This is a real, installable download that
 * doesn't need the Play Store — hosted on Expo's artifact CDN, so it has its own
 * allowlist (the store hosts above deliberately exclude it). Overridable per
 * environment via NEXT_PUBLIC_ANDROID_APK_URL; falls back to the latest build.
 */
const ALLOWED_APK_HOSTS = new Set(["expo.dev"]);

export function safeApkUrl(raw: string | undefined | null): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    if (!ALLOWED_APK_HOSTS.has(url.hostname.toLowerCase())) return null;
    return url.toString();
  } catch {
    return null;
  }
}

const DEFAULT_ANDROID_APK_URL =
  "https://expo.dev/artifacts/eas/zCk7VdLNgw1VYpNte2BnFuJbNlxTldm1Kp64B5-Mh3o.apk";

export const ANDROID_APK_URL: string | null =
  safeApkUrl(process.env.NEXT_PUBLIC_ANDROID_APK_URL) ?? safeApkUrl(DEFAULT_ANDROID_APK_URL);

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://strikersfeed.club";
export const DOWNLOAD_URL = `${SITE_URL.replace(/\/$/, "")}/download`;

/** Resolve the right iOS destination for the current release state, or null. */
export function iosDestination(status: MobileAppStatus = MOBILE_APP_STATUS): string | null {
  if (status === "LIVE") return IOS_APP_URL;
  if (status === "BETA") return TESTFLIGHT_URL;
  return null;
}

/** Resolve the right Android destination for the current release state, or null. */
export function androidDestination(status: MobileAppStatus = MOBILE_APP_STATUS): string | null {
  if (status === "LIVE") return ANDROID_APP_URL;
  if (status === "BETA") return ANDROID_BETA_URL;
  return null;
}

export interface StoreCta {
  ios: string;
  android: string;
  badgeLabel: string;
}

/** User-facing CTA labels for the current release state. */
export function storeCtas(status: MobileAppStatus = MOBILE_APP_STATUS): StoreCta {
  switch (status) {
    case "LIVE":
      return {
        ios: "Download on the App Store",
        android: "Get it on Google Play",
        badgeLabel: "Available now",
      };
    case "BETA":
      return {
        ios: "Join TestFlight Beta",
        android: "Join Android Beta",
        badgeLabel: "In beta",
      };
    default:
      return {
        ios: "Notify me",
        android: "Notify me",
        badgeLabel: "Coming soon",
      };
  }
}
