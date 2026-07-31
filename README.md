# StrikersFeed

**The social home of the Strikers Club community.**

StrikersFeed is an independent, community-run platform that blends the social
experience of X, TikTok and Facebook with competitive football features —
players, teams, matches, discussions and tournaments — for the Strikers Club
community.

> **Disclaimer:** StrikersFeed is an independent community platform and is not
> affiliated with or endorsed by the creators of Strikers Club.

---

## Phase 1 scope

This repository currently contains the **Phase 1 front-end foundation**: a
polished, responsive UI running entirely on local mock data, architected so the
Supabase backend and live data providers can be dropped in without rewriting the
UI.

**In this phase**

- Logged-out landing page (`/`)
- Logged-in social feed (`/feed`) — composer, For You / Following, post types
- Shared responsive navigation (top navbar, mobile bottom nav, mobile menu)
- Reusable design system + component library
- All required routes wired up (no generic 404s) with branded coming-soon states
- Strongly-typed development mock data, isolated from future production data
- Future-ready `MatchProvider` interface (mock implementation)

**Not in this phase** (intentionally): real authentication, backend, tournament
engine, and the video/clip processing pipeline.

## Tech stack

- **Next.js 15** (App Router) — Server Components by default
- **TypeScript** (strict)
- **Tailwind CSS 3.4** — brand tokens as CSS variables in `src/app/globals.css`
- **lucide-react** icons
- **next/font** (Inter + Barlow Condensed), **next/image** for local assets
- Deploys on **Netlify** (`netlify.toml` + Next.js runtime plugin)

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. No environment variables are required in Phase 1.

```bash
npm run lint    # ESLint (next/core-web-vitals + next/typescript)
npm run build   # production build
npm start       # serve the production build
```

## Project structure

```
public/assets/
  brand/            # logo, mark, source logo
  illustrations/    # stadium hero
src/
  app/              # App Router routes + layout + metadata + icons
  components/
    layout/         # navbar, mobile nav, footer, logo, page container
    landing/        # logged-out landing sections
    feed/           # feed shell, composer, sidebars, post components
    social/         # follow button, trending, suggested account, match card
    ui/             # design-system primitives (Button, Avatar, Card, …)
    auth/           # demo auth forms
    providers/      # SessionProvider (demo session)
  config/           # site + navigation config
  data/
    config.ts       # USE_MOCK_DATA flag + notices
    mock/           # DEV-ONLY fictional data (players, teams, matches, …)
  lib/
    providers/      # MatchProvider interface + mock provider + factory
    format.ts, cn.ts, matchLabels.ts
  types/            # shared domain types
design-references/  # supplied design mockups (documentation only)
```

## Data & authentication (important)

- **All content is development mock data** under `src/data/mock/`, clearly
  flagged in `src/data/config.ts`. Names, teams, stats and "live" matches are
  **fictional demo content** — nothing is real, live, or persisted.
- Feed interactions (like, repost, bookmark, poll votes, new posts) use **local
  component state only** and are **not saved** anywhere.
- Authentication is a **clearly-labelled demo session** (localStorage) — it is
  **not real auth** and stores/sends no credentials.

## Path to production (Phase 2)

- Wire **Supabase** for auth + data. Env vars are documented in `.env.example`
  (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, …).
- Replace mock selectors in `src/data/mock` with provider-backed queries that
  return the same typed shapes.
- Implement additional match sources behind the existing `MatchProvider`
  interface (`src/lib/providers/`) — e.g. a future UUB provider, the StrikersFeed
  tournament engine, or manual community submissions — without UI changes.
- Build out messaging, uploads/clip processing, and the tournament bracket
  engine.
