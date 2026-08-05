import type { ExpoConfig } from "expo/config";

/**
 * StrikersFeed mobile app config.
 *
 * ⚠️ Identifiers below are configured LOCALLY and must be confirmed/registered:
 *  - iOS bundle id  `club.strikersfeed.app`   → Apple Developer + App Store Connect
 *  - Android package `club.strikersfeed.app`  → Google Play Console
 *  - `owner`/`extra.eas.projectId`            → set by `eas init`
 * Do not assume these are claimed until the developer accounts exist.
 *
 * Public config only. NEVER put SUPABASE_SERVICE_ROLE_KEY / CLOUDFLARE_STREAM_API_TOKEN
 * / CRON_SECRET here — use EXPO_PUBLIC_* for public values only.
 */
const config: ExpoConfig = {
  name: "StrikersFeed",
  slug: "strikersfeed",
  scheme: "strikersfeed",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "dark",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#080A09",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "club.strikersfeed.app",
    supportsTablet: false,
    associatedDomains: ["applinks:strikersfeed.club"],
  },
  android: {
    package: "club.strikersfeed.app",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#080A09",
    },
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [{ scheme: "https", host: "strikersfeed.club" }],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    ["expo-image-picker", { photosPermission: "Allow StrikersFeed to access your photos to post clips and images." }],
    "expo-notifications",
  ],
  extra: {
    router: { origin: false },
    // Set by `eas init` — placeholder until then.
    eas: { projectId: "REPLACE_WITH_EAS_PROJECT_ID" },
  },
  experiments: { typedRoutes: true },
};

export default config;
