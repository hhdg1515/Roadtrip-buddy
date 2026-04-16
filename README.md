# OpenSeason

OpenSeason is a California-first road trip decision app. The first cut is a web MVP that answers:

- Where should I go this weekend?
- Is this destination actually good right now?
- What is the backup plan if conditions shift?

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui-ready component structure
- Supabase Postgres + Auth scaffolding

## Current Scope

- `Now` ranking page
- `Explore` browse layer
- `Destination Detail`
- `Plan` comparison view
- `Generated Trip Plan`
- `Saved`
- `Profile`

The app is currently seeded with a deterministic California dataset so the product logic can be proven before live API ingestion.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Run the app:

```bash
npm run dev
```

4. Optional checks:

```bash
npm run lint
npm run typecheck
```

5. Optional Supabase commands:

```bash
npm run supabase:check
npm run supabase:seed
```

## Supabase

Supabase is scaffolded but not required for anonymous browsing yet.

- Fill `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Or use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` if your dashboard shows the newer key format
- Fill `SUPABASE_SERVICE_ROLE_KEY` for legacy projects or `SUPABASE_SECRET_KEY` for newer projects if you want to run the seed script
- Run `supabase/sql/openseason-bootstrap.sql` in the Supabase SQL editor
- Follow [docs/supabase-setup.md](docs/supabase-setup.md) for the beginner-friendly flow

## Architecture Notes

- Product and technical blueprint: [docs/mvp-architecture.md](docs/mvp-architecture.md)
- Supabase setup guide: [docs/supabase-setup.md](docs/supabase-setup.md)
- Product requirements: [PRD.md](PRD.md)
