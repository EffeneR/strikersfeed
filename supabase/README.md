# Supabase setup (Phase 2 — auth foundation)

This wires **real authentication** into StrikersFeed. Until you complete these
steps the app keeps running in **demo mode** (mock data + a labelled demo
session) — nothing here is required to run Phase 1.

## 1. Create a Supabase project
1. Go to <https://supabase.com>, sign in, and create a new project.
   *(Claude can't create the account/project for you — this step is yours.)*
2. Wait for it to finish provisioning.

## 2. Run the database migration
Open **SQL Editor** in the Supabase dashboard, paste the contents of
[`migrations/0001_profiles.sql`](./migrations/0001_profiles.sql), and run it.

This creates the `account_role` enum, the `profiles` table (with row-level
security), and a trigger that auto-creates a profile on sign-up from the
`display_name` + `role` chosen at registration.

*(CLI alternative: with the [Supabase CLI](https://supabase.com/docs/guides/cli)
linked to your project, run `supabase db push`.)*

## 3. Add environment variables
From **Settings → API**, copy the values into `.env.local` (see `.env.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

## 4. Auth settings (recommended for local testing)
In **Authentication → Providers → Email**:
- To test sign-up → instant login without a real inbox, **disable "Confirm email"**.
- Otherwise, leave it on and the app will prompt users to confirm via email
  before signing in.

Add `http://localhost:3000` under **Authentication → URL Configuration** for
local development.

## 5. Run it
```bash
npm run dev
```
Registration and login now use Supabase. Sign-out is real. The account-type
chosen at registration is stored on the new profile row.

## What's wired vs. not (this slice)
- **Wired:** real sign-up / sign-in / sign-out, session refresh middleware,
  `profiles` table keyed by account role, logged-in chrome driven by the real
  session.
- **Not yet:** feed/posts/players/teams still read from mock data (the data
  migration is the next slice), plus uploads, messaging and tournaments.

## How the code decides which mode to use
`src/lib/supabase/config.ts` → `isSupabaseConfigured()` returns true only when
both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set.
Everything (layout, `SessionProvider`, `AuthCard`, `middleware`) branches on it,
so an unconfigured deploy safely falls back to demo mode.
