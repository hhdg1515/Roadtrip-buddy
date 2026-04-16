import path from "node:path";
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { destinations } from "../src/lib/data/openseason";
import { destinationSeedMeta } from "../src/lib/data/openseason-seed-meta";

loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
loadEnv({ path: path.resolve(process.cwd(), ".env") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL and a server-side seed key in .env.local.",
  );
  process.exit(1);
}

async function main() {
  const supabase = createClient(url!, serviceRoleKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const destinationRows = destinations.map((destination) => {
    const meta = destinationSeedMeta[destination.slug as keyof typeof destinationSeedMeta];

    return {
      slug: destination.slug,
      name: destination.name,
      region: destination.region,
      state: "CA",
      destination_type: meta.destinationType,
      summary: destination.summary,
      latitude: meta.latitude,
      longitude: meta.longitude,
      best_months: meta.bestMonths,
      avoid_months: meta.avoidMonths,
      base_towns: meta.baseTowns,
      tags: destination.tags,
    };
  });

  const { error: destinationError } = await supabase
    .from("destinations")
    .upsert(destinationRows, { onConflict: "slug" });

  if (destinationError) {
    throw destinationError;
  }

  const { data: destinationIds, error: destinationIdError } = await supabase
    .from("destinations")
    .select("id, slug");

  if (destinationIdError) {
    throw destinationIdError;
  }

  const idBySlug = new Map((destinationIds ?? []).map((row) => [row.slug, row.id]));
  const destinationIdsToSeed = destinations
    .map((destination) => idBySlug.get(destination.slug))
    .filter((value): value is string => Boolean(value));

  if (destinationIdsToSeed.length === 0) {
    throw new Error("No destination ids returned from Supabase after upsert.");
  }

  const { error: deleteAreasError } = await supabase
    .from("destination_areas")
    .delete()
    .in("destination_id", destinationIdsToSeed);

  if (deleteAreasError) {
    throw deleteAreasError;
  }

  const areaRows = destinations.map((destination) => {
    const destinationId = idBySlug.get(destination.slug);
    const meta = destinationSeedMeta[destination.slug as keyof typeof destinationSeedMeta];

    return {
      destination_id: destinationId!,
      name: meta.area.name,
      area_type: meta.area.areaType,
      latitude: meta.latitude,
      longitude: meta.longitude,
      elevation_ft: meta.area.elevationFt,
      summary: meta.area.summary,
    };
  });

  const { error: areaInsertError } = await supabase
    .from("destination_areas")
    .insert(areaRows);

  if (areaInsertError) {
    throw areaInsertError;
  }

  const { error: deleteRulesError } = await supabase
    .from("seasonal_rules")
    .delete()
    .in("destination_id", destinationIdsToSeed);

  if (deleteRulesError) {
    throw deleteRulesError;
  }

  const seasonalRuleRows = destinations.flatMap((destination) => {
    const destinationId = idBySlug.get(destination.slug)!;
    const meta = destinationSeedMeta[destination.slug as keyof typeof destinationSeedMeta];
    const riskNotes = [destination.mainWarning];

    return [
      ...meta.bestMonths.map((month) => ({
        destination_id: destinationId,
        month,
        activity_type: destination.bestActivity,
        score: Math.min(destination.breakdown.seasonality + 4, 96),
        explanation: `Seeded strong month for ${destination.bestActivity.toLowerCase()}.`,
        risk_notes: riskNotes,
      })),
      ...meta.avoidMonths.map((month) => ({
        destination_id: destinationId,
        month,
        activity_type: destination.bestActivity,
        score: 35,
        explanation: `Seeded caution month. OpenSeason should down-rank this destination unless constraints strongly fit.`,
        risk_notes: riskNotes,
      })),
    ];
  });

  if (seasonalRuleRows.length > 0) {
    const { error: seasonalRuleInsertError } = await supabase
      .from("seasonal_rules")
      .insert(seasonalRuleRows);

    if (seasonalRuleInsertError) {
      throw seasonalRuleInsertError;
    }
  }

  const snapshotRows = destinations.map((destination) => ({
    destination_id: idBySlug.get(destination.slug)!,
    current_verdict: destination.currentVerdict,
    why_now: destination.whyNow,
    main_warning: destination.mainWarning,
    best_activity: destination.bestActivity,
    seasonal_window: destination.seasonalWindow,
    palette: destination.palette,
    drive_hours: destination.driveHours,
    ideal_trip_lengths: destination.idealTripLengths,
    collections: destination.collections,
    risk_badges: destination.riskBadges,
    score_breakdown: destination.breakdown,
    activities: destination.activities,
    avoid_items: destination.avoid,
    suggested_stops: destination.suggestedStops,
    food_support: destination.foodSupport,
    lodging: destination.lodging,
    plan_b: destination.planB,
    itinerary: destination.itinerary,
    current_fit_score: destination.fitScore,
    current_fit_label: destination.fitLabel,
    updated_at: new Date().toISOString(),
  }));

  const { error: snapshotError } = await supabase
    .from("destination_content_snapshots")
    .upsert(snapshotRows, { onConflict: "destination_id" });

  if (snapshotError) {
    throw snapshotError;
  }

  console.log("Seed complete.");
  console.log(`destinations: ${destinationRows.length}`);
  console.log(`destination areas: ${areaRows.length}`);
  console.log(`seasonal rules: ${seasonalRuleRows.length}`);
  console.log(`content snapshots: ${snapshotRows.length}`);
}

main().catch((error) => {
  console.error("Supabase seed failed.");
  console.error(error);
  process.exit(1);
});
