# OpenSeason MVP Architecture

## Product Slice

The first slice matches the PRD wedge:

- `Now`: rank the best current California road trip options for a given origin and trip length.
- `Destination Detail`: explain why a place is strong or weak right now.
- `Plan`: compare the top options for a constrained scenario.
- `Generated Trip Plan`: turn the winner into a practical itinerary with a real Plan B.
- `Saved`: keep generated plans and later re-run condition checks.

## Web-First Decision

Start with `Next.js` web, not `Expo`, because the MVP is a planning product before it is an in-car companion. The current UI benefits more from fast iteration, shareable URLs, server rendering, and low-friction deployment than from mobile-native APIs.

## Frontend Structure

- `src/app/page.tsx`: `Now` surface
- `src/app/explore/page.tsx`: lightweight browse layer
- `src/app/destinations/[slug]/page.tsx`: decision-quality detail
- `src/app/plan/page.tsx`: constraints + comparison
- `src/app/plans/[slug]/page.tsx`: generated itinerary
- `src/app/saved/page.tsx`: saved plan shell
- `src/app/profile/page.tsx`: stored defaults

## Data Strategy

V1 uses a deterministic local dataset in `src/lib/data/openseason.ts` so product logic can be tested before live ingestion.

- Each destination carries explainable scoring inputs, not only a final score.
- Rankings are produced by `src/lib/scoring/trip-fit.ts`.
- API routes expose the same deterministic data through `api/recommendations` and `api/plans/[slug]`.

## Supabase Boundary

Supabase is set up as the persistence and auth layer, but not yet required for anonymous browsing.

- `middleware.ts`: auth session refresh path
- `src/lib/supabase/client.ts`: browser client
- `src/lib/supabase/server.ts`: server client
- `src/lib/data/repository.ts`: Supabase-first repository with local fallback
- `supabase/migrations/0001_initial_schema.sql`: initial schema
- `supabase/migrations/0002_destination_content_snapshots.sql`: MVP content snapshot table

The schema deliberately includes `destination_areas` so Yosemite, Tahoe, Mammoth, and similar regions can hold multiple condition snapshots instead of one misleading destination-level point.

## Next Build Steps

1. Run the bootstrap SQL and the seed script against a real Supabase project.
2. Replace seeded snapshots with scheduled refresh jobs for weather, alerts, and route risk.
3. Add anonymous-to-auth save flow so users can browse first and log in only when saving or sharing.
4. Continue expanding and tuning the statewide California destination set as live-data coverage improves.
