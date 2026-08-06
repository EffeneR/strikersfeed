# StrikersFeed — Mobile (Expo)

Native iOS + Android app for StrikersFeed. **Separate Expo project** (its own
`package.json`) that shares the **same Supabase backend** as the website — no
mobile-only data model. The Next.js web app is untouched, so the Netlify deploy
is unaffected.

> Status: **feature-complete, build-ready.** Installs, type-checks and lints
> clean, and passes `expo-doctor` (18/18). Implemented against the shared backend:
> auth, feed, **post detail + comments**, **profiles**, **search**, **bookmarks**,
> **notifications** (replies to your posts), text + **image** posting,
> **moderation** (report post/comment/profile, block, delete account), **push
> notifications**, and settings (edit profile + avatar, notification prefs, Steam
> link, blocked, legal). Matches/teams/players/tournaments use bundled **sample**
> content (no live sports backend yet). Native **video** upload is the one gated
> item (needs Cloudflare Stream — see "Remaining work").

## Backend requirements

Run these in the shared Supabase project before building:

- Migrations `0001`–`0011` in order. In particular:
  - **`0010_moderation.sql`** — `content_reports` + `blocked_users` (report/block
    do nothing until this is run).
  - **`0011_device_tokens.sql`** — `device_tokens` + `notification_prefs` (push
    registration + preferences).
- Edge Functions (each reads `SUPABASE_SERVICE_ROLE_KEY` from the auto-injected
  Edge Function env — never shipped in the app bundle):
  ```bash
  supabase functions deploy delete-account          # in-app account deletion
  supabase functions deploy send-push --no-verify-jwt   # push on new replies
  ```
- **Push webhook:** Dashboard → Database → Webhooks → create a webhook on
  `public.comments` **INSERT** that POSTs to the `send-push` function URL. For
  security, `supabase secrets set PUSH_WEBHOOK_SECRET=<random>` and add header
  `x-webhook-secret: <random>` to the webhook.
- Storage buckets `post-images` and `avatars` (from `0003` / `0008`).

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
- The app scheme (`strikersfeed://…`) resolves to Expo Router file routes today.
- **Universal-link path alignment is a follow-up:** the web association files list
  `/posts/*`, `/matches/*`, … (plural) while the app routes are `post/[id]`,
  `user/[id]`, `match/[id]`. Align these (and add the Team ID + fingerprint) before
  relying on https links from the website opening a specific in-app screen. Not
  required for the APK to install and run.

## ⭐ Build the free Android APK (no developer account, no cost)

This is the primary distribution path right now: a standalone, installable `.apk`
with its own icon and a public download link, built in Expo's free cloud. Only a
**free Expo account** is required — no Google Play account, no fee.

```bash
npm install -g eas-cli          # one time
cd mobile
eas login                       # sign in to your free Expo account
eas init                        # creates the project, writes the real projectId
eas build --platform android --profile preview
```

When the build finishes, EAS prints a hosted **`.apk` URL** — that's the download
link. Anyone can install it (Android may ask to allow "install from this source").
Put that URL into the website via `NEXT_PUBLIC_ANDROID_APP_URL` +
`NEXT_PUBLIC_MOBILE_APP_STATUS=LIVE` (see `../src/config/mobileApp.ts`) so
`/download` and `/app` hand it out.

> CI / hands-off: generate a token at **expo.dev → Account → Access tokens**, then
> `EXPO_TOKEN=<token> eas build --platform android --profile preview --non-interactive`.
> Treat the token like a secret — keep it in the environment, never commit it.

## EAS build profiles (`eas.json`)

- **development** — dev client, internal, iOS simulator OK.
- **preview** — internal distribution, **Android APK**, real-device iOS.
- **production** — store builds, auto-incremented.

### First TestFlight build (iOS) — needs Apple Developer ($99/yr)
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

- [x] App icon (1024×1024)  [x] Adaptive Android icon  [x] Splash screen
      — generated from the brand mark into `assets/` (swap for hand-crafted art
      before a public store listing if you want a more polished mark).
- [ ] Play feature graphic (1024×500)  [ ] iOS marketing icon (if listing)
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
- **Report** also works on **comments** (post-detail thread) and **profiles**
  (user screen), matching the web.
- **Account deletion** — **Settings → Delete account** calls the `delete-account`
  Edge Function and signs out.
- **Policies** — Settings links to the live Community Guidelines / Privacy / Terms.

## Remaining work
- Native **video** upload (Cloudflare Stream direct upload) + Medal link in the
  composer — images already upload to Supabase Storage. **Gated on a Cloudflare
  Stream account** (the one paid/external dependency).
- Live sports data: matches / teams / players / tournaments currently show bundled
  **sample** content — wire a real provider when one exists.
- Universal-link path alignment (see "Deep links").
- Real store metadata + screenshots + the identifier confirmations above (only
  needed when you submit to a store; not needed for the free APK).
