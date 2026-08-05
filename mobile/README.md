# StrikersFeed — Mobile (Expo)

Native iOS + Android app for StrikersFeed. **Separate Expo project** (its own
`package.json`) that shares the **same Supabase backend** as the website — no
mobile-only data model. The Next.js web app is untouched, so the Netlify deploy
is unaffected.

> Status: **foundation / scaffold**. Auth, the feed, and text posting are wired
> to the shared backend. Media upload (image picker + Cloudflare Stream), the
> full screen set, push notifications, and reporting/blocking are the next slices
> — this is **not yet ready for store submission** (see "Remaining work").

## Run it

```bash
cd mobile
cp .env.example .env.local        # fill in EXPO_PUBLIC_SUPABASE_URL + ANON_KEY
npm install
npx expo install --fix            # align native dep versions to the Expo SDK
npm run start                     # Expo dev server (scan QR with Expo Go / dev build)
```

From the repo root you can also use: `npm run mobile:start` / `mobile:ios` /
`mobile:android` / `mobile:lint` / `mobile:typecheck` / `mobile:build:preview`.

## Environment (public only)

`EXPO_PUBLIC_*` values are bundled into the app, so they must be public:

| Var | Notes |
|-----|-------|
| `EXPO_PUBLIC_SUPABASE_URL` | Same project as the website |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `EXPO_PUBLIC_SITE_URL` | `https://strikersfeed.club` |

**Never** put `SUPABASE_SERVICE_ROLE_KEY`, `CLOUDFLARE_STREAM_API_TOKEN`, or
`CRON_SECRET` in the mobile bundle.

## Identifiers — CONFIRM before submission

Configured locally in `app.config.ts` / `eas.json`; **must be registered/confirmed**:

| Thing | Value | Where to confirm |
|-------|-------|------------------|
| iOS bundle id | `club.strikersfeed.app` | Apple Developer → Identifiers |
| Android package | `club.strikersfeed.app` | Google Play Console |
| Deep-link scheme | `strikersfeed` | — |
| EAS project id | `REPLACE_WITH_EAS_PROJECT_ID` | `eas init` |
| Apple Team ID | `REPLACE_APPLE_TEAM_ID` | Apple Developer (also in web `apple-app-site-association`) |
| Android SHA-256 fingerprint | `REPLACE_ANDROID_SHA256_CERT_FINGERPRINT` | EAS credentials (also in web `assetlinks.json`) |

## Deep links / Universal Links

- iOS: `app.config.ts` → `ios.associatedDomains: ["applinks:strikersfeed.club"]`.
- Android: `intentFilters` with `autoVerify` for `https://strikersfeed.club`.
- Web association files live at `../public/.well-known/apple-app-site-association`
  and `../public/.well-known/assetlinks.json` — fill in the real Team ID + package
  + fingerprint there. Until the app is installed, these URLs keep opening the web
  pages.
- Supported paths: `/posts/*`, `/matches/*`, `/players/*`, `/teams/*`, `/tournaments/*`.

## EAS build profiles (`eas.json`)

- **development** — dev client, internal, iOS simulator OK.
- **preview** — internal distribution, Android APK, real-device iOS.
- **production** — store builds, auto-incremented.

### First TestFlight build (iOS)
1. Enroll in the **Apple Developer Program** ($99/yr).
2. Create the **bundle id** `club.strikersfeed.app` (Identifiers).
3. Create the app record in **App Store Connect**.
4. `eas init` (sets the project id), then `eas credentials` (or let EAS manage signing).
5. `eas build --profile production --platform ios`.
6. `eas submit --platform ios` → uploads to **TestFlight**.
7. Add internal testers in App Store Connect → TestFlight.
8. Set `NEXT_PUBLIC_TESTFLIGHT_URL` on the website to the public TestFlight link.

### First Android testing build
1. Register as a **Google Play Developer** ($25 one-time).
2. Create the app + **package** `club.strikersfeed.app` in Play Console.
3. `eas build --profile production --platform android` (App Bundle).
4. Create a **Google Play service account** JSON → `google-play-service-account.json`
   (kept out of git); `eas submit --platform android --track internal`.
5. Set up **internal/closed testing**, add testers.
6. Complete the **Data safety** form + content rating.
7. Set `NEXT_PUBLIC_ANDROID_BETA_URL` (or `NEXT_PUBLIC_ANDROID_APP_URL` when live).

> Do not run a paid production store build without explicit sign-off.

## Store assets checklist (create real ones — don't fabricate)

- [ ] App icon (1024×1024)  [ ] Adaptive Android icon  [ ] iOS icon
- [ ] Splash screen  [ ] Play feature graphic (1024×500)
- [ ] iPhone screenshots (6.7" + 6.5")  [ ] Android phone screenshots
- [ ] App description  [ ] Promo copy  [ ] Keywords
- [ ] Support URL  [ ] Privacy policy URL  [ ] Terms URL  [ ] Account-deletion URL
- [ ] Review demo account  [ ] App review notes  [ ] Content-rating declarations

## Moderation status (required before submission)

Reporting (post/comment/profile), blocking, content-removal states, community
guidelines, ToS, privacy policy, support contact, and account deletion are
**not yet implemented in the app** — they must work (not be fake buttons) before
either store will accept UGC. These are the top priority of the next slice.

## Remaining work before store submission
- Media upload (expo-image-picker + Cloudflare Stream direct upload) in the composer
- Full screens: notifications, messages, search, teams, team/player/tournament,
  match detail + thread, post detail, comments, bookmarks, settings, connections
- Push notifications (token storage + preferences) — `expo-notifications`
- Reporting + blocking + moderation integration (see above)
- Deep-link route handling for all supported paths
- Real store metadata, screenshots, and the identifier confirmations above
