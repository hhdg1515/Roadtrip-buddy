# Supabase Setup

## Recommended Path

For a first setup, use the Supabase dashboard SQL editor for schema creation, then use the local seed script for the demo content.

## What You Need

- A Supabase project
- `NEXT_PUBLIC_SUPABASE_URL`
- One public client key:
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`, or
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- One server-side seed key:
  - `SUPABASE_SERVICE_ROLE_KEY`, or
  - `SUPABASE_SECRET_KEY`
- Optional live-data keys:
  - `NPS_API_KEY`
  - `NWS_CONTACT_EMAIL`
  - `OPENSEASON_SITE_URL`
  - `CRON_SECRET`

## Files In This Repo

- `supabase/sql/openseason-bootstrap.sql`: one-shot bootstrap SQL for the current schema
- `supabase/migrations/0001_initial_schema.sql`: base tables
- `supabase/migrations/0002_destination_content_snapshots.sql`: MVP content snapshot table
- `scripts/check-supabase.ts`: checks whether the app can read your project
- `scripts/seed-supabase.ts`: seeds the current California destination set and their snapshots
- `scripts/sync-conditions.ts`: refreshes weather, alerts, and destination snapshots
- `src/app/api/admin/sync-conditions/route.ts`: protected HTTP trigger for the same sync flow

## Dashboard-First Setup

1. Create a new Supabase project.
2. Open the SQL editor in Supabase.
3. Paste the contents of `supabase/sql/openseason-bootstrap.sql` and run it once.
4. In Project Settings, copy:
   - project URL
   - a public client key
   - a server-side key
5. Put those values into `.env.local`.
6. Run `npm run supabase:check`.
7. Run `npm run supabase:seed`.
8. Run `npm run supabase:check` again to confirm rows exist.

## After Seeding

Once the tables exist and the seed runs, the app will automatically start preferring Supabase data over the built-in local dataset.

If Supabase is unreachable or incomplete, the app falls back to local seed data so development does not stop.

If your dashboard only shows the newer key names, use:

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for the browser-safe key
- `SUPABASE_SECRET_KEY` for the server-only seed key

## Live Conditions Sync

To populate real weather and active alerts, fill these optional vars in `.env.local`:

- `NWS_CONTACT_EMAIL`
- `OPENSEASON_SITE_URL`
- `NPS_API_KEY` if you want Yosemite / Death Valley park alerts
- `CRON_SECRET` if you want to trigger sync through HTTP

CalTrans lane-closure sync now runs as part of `conditions:alerts` and `conditions:sync`. It does not require an API key.

Local refresh commands:

```bash
npm run conditions:weather
npm run conditions:alerts
npm run conditions:snapshots
```

Or run the full chain:

```bash
npm run conditions:sync
```

## Protected Sync Route

The app now includes `GET` and `POST` on `/api/admin/sync-conditions`.

It runs:

1. weather snapshot ingestion
2. alert ingestion
3. destination snapshot refresh

It requires `CRON_SECRET`.

Example with PowerShell:

```powershell
Invoke-RestMethod `
  -Method POST `
  -Headers @{ Authorization = "Bearer YOUR_CRON_SECRET" } `
  -Uri http://localhost:3000/api/admin/sync-conditions
```

Example with curl:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/admin/sync-conditions
```

This route is the easiest bridge to a future Vercel Cron or any scheduler you prefer.

## Auth Setup For MVP

OpenSeason now uses Supabase email magic links for MVP auth.

What to configure in Supabase:

1. Open `Authentication`.
2. Keep the email provider enabled.
3. In URL configuration, set your local app URL.
4. Add the callback URL used by this app.

For local development, use:

- Site URL: `http://localhost:3000`
- Redirect URL: `http://localhost:3000/auth/callback`

Recommended `.env.local` additions:

```env
OPENSEASON_SITE_URL=http://localhost:3000
```

After that:

1. Open `/profile`
2. Request a magic link
3. Click the email link
4. Return to the app with an authenticated session

Once signed in, you can:

- save trip plans into `trip_plans`
- store profile defaults in `user_preferences`
- load your saved plans on `/saved`
