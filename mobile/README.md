# StrikersFeed — Mobile (Expo)

Native iOS + Android app for StrikersFeed. **Separate Expo project** (its own
`package.json`) that shares the **same Supabase backend** as the website — no
mobile-only data model. The Next.js web app is untouched, so the Netlify deploy
is unaffected.

> Status: **foundation**. Auth, the feed, text + **image** posting, and
> **moderation (report / block / delete account)** are wired to the shared
> backend. Native **video** upload (Cloudflare Stream), the full screen set, and
> push notifications are the remaining slices — see "Remaining work".

## Backend requirements

The app expects these to exist in the shared Supabase project:

- Migrations `0001`–`0008` (profiles, posts, media, reactions, comments, avatars).
- Migration **`0010_moderation.sql`** — `content_reports` + `blocked_users`
  (report, block, and auto-hide). Report/block do nothing until this is run.
- Edge Function **`delete-account`** for in-app account deletion (the app can't
  hold the service-role key):
  ```bash
  supabase functions deploy delete-account
  ```
  The function reads `SUPABASE_SERVICE_ROLE_KEY` from the Edge Function
  environment (auto-injected) — it is never shipped in the app bundle.

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

## Moderation (implemented — required for UGC submission)

These are real, wired to Supabase (not placeholder buttons):

- **Report** — the "…" menu on any other member's post opens a reason picker
  (`ReportSheet`) that writes to `content_reports`. Content that crosses the
  distinct-reporter threshold is auto-hidden by the DB trigger in `0010`.
- **Block** — the same menu blocks an account; blocked authors are filtered from
  the feed immediately and on reload. Manage them in **Profile → Blocked accounts**.
- **Account deletion** — **Profile → Delete account** calls the `delete-account`
  Edge Function and signs out.
- **Policies** — Profile links to the live Community Guidelines / Privacy / Terms
  pages on the website.

Still to add here: reporting from comment/profile screens once those screens
exist (the web app already reports posts **and** comments).

## Remaining work before store submission
- Native **video** upload (Cloudflare Stream direct upload) + Medal link in the
  composer — images already upload to Supabase Storage. Needs a Cloudflare account.
- Full screens: notifications, messages, search, teams, team/player/tournament,
  match detail + thread, post detail, comments, bookmarks, settings, connections
- Push notifications (token storage + preferences) — `expo-notifications`
- Deep-link route handling for all supported paths
- Real store metadata, screenshots, and the identifier confirmations above
