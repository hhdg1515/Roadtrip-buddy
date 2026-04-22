import "server-only";
import { cache } from "react";
import { labelTripFitScore, type ScoreBreakdown } from "@/lib/scoring/trip-fit";
import {
  type DestinationAlert,
  destinations as localDestinations,
  findDestinationBySlug,
  type LiveWeatherSnapshot,
  rankDestinationList,
  type Destination,
  type RankingContext,
  type Origin,
  type RankedDestination,
  type TripLength,
} from "@/lib/data/openseason";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createPublicServerClient } from "@/lib/supabase/public-server";

type DestinationSnapshotRow = {
  destination_id: string;
  current_verdict: string | null;
  why_now: string | null;
  main_warning: string | null;
  best_activity: string | null;
  seasonal_window: string | null;
  palette: string[] | null;
  drive_hours: Partial<Record<Origin, number>> | null;
  ideal_trip_lengths: TripLength[] | null;
  collections: string[] | null;
  risk_badges: string[] | null;
  score_breakdown: Partial<ScoreBreakdown> | null;
  activities: Destination["activities"] | null;
  avoid_items: string[] | null;
  suggested_stops: string[] | null;
  food_support: Destination["foodSupport"] | null;
  lodging: Destination["lodging"] | null;
  plan_b: Destination["planB"] | null;
  itinerary: Destination["itinerary"] | null;
  current_fit_score: number | null;
  current_fit_label: string | null;
  updated_at: string | null;
  destination:
    | {
        slug: string;
        name: string;
        region: string;
        summary: string;
        tags: string[] | null;
      }
    | Array<{
        slug: string;
        name: string;
        region: string;
        summary: string;
        tags: string[] | null;
      }>
    | null;
};

type WeatherSnapshotRow = {
  destination_id: string;
  snapshot_date: string;
  high_temp: number | null;
  low_temp: number | null;
  precipitation_probability: number | null;
  wind_speed: number | null;
  snow_risk: number | null;
  heat_risk: number | null;
};

type AlertRow = {
  destination_id: string;
  source: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string | null;
  effective_date: string | null;
  expiration_date: string | null;
};

const defaultBreakdown: ScoreBreakdown = {
  seasonality: 70,
  weather: 70,
  activityMatch: 70,
  driveTime: 70,
  alerts: 70,
  groupFit: 70,
  lodging: 70,
  planB: 70,
};

function normalizeBreakdown(
  breakdown: Partial<ScoreBreakdown> | null | undefined,
  fallback: ScoreBreakdown,
): ScoreBreakdown {
  return {
    seasonality: breakdown?.seasonality ?? fallback.seasonality,
    weather: breakdown?.weather ?? fallback.weather,
    activityMatch: breakdown?.activityMatch ?? fallback.activityMatch,
    driveTime: breakdown?.driveTime ?? fallback.driveTime,
    alerts: breakdown?.alerts ?? fallback.alerts,
    groupFit: breakdown?.groupFit ?? fallback.groupFit,
    lodging: breakdown?.lodging ?? fallback.lodging,
    planB: breakdown?.planB ?? fallback.planB,
  };
}

function groupLatestWeatherByDestination(rows: WeatherSnapshotRow[]) {
  const latestDateByDestination = new Map<string, string>();

  for (const row of rows) {
    const current = latestDateByDestination.get(row.destination_id);
    if (!current || row.snapshot_date > current) {
      latestDateByDestination.set(row.destination_id, row.snapshot_date);
    }
  }

  const weatherByDestination = new Map<string, LiveWeatherSnapshot>();

  for (const [destinationId, snapshotDate] of latestDateByDestination) {
    const bucket = rows.filter(
      (row) => row.destination_id === destinationId && row.snapshot_date === snapshotDate,
    );

    if (bucket.length === 0) {
      continue;
    }

    weatherByDestination.set(destinationId, {
      snapshotDate,
      highTemp: roundAverage(bucket.map((row) => row.high_temp)),
      lowTemp: roundAverage(bucket.map((row) => row.low_temp)),
      precipitationProbability: maxValue(bucket.map((row) => row.precipitation_probability)),
      windSpeed: maxValue(bucket.map((row) => row.wind_speed)),
      snowRisk: maxValue(bucket.map((row) => row.snow_risk)),
      heatRisk: maxValue(bucket.map((row) => row.heat_risk)),
    });
  }

  return weatherByDestination;
}

function groupActiveAlertsByDestination(rows: AlertRow[]) {
  const now = Date.now();
  const alertsByDestination = new Map<string, DestinationAlert[]>();

  for (const row of rows) {
    const expirationTime =
      row.expiration_date == null ? null : new Date(row.expiration_date).getTime();

    if (expirationTime != null && expirationTime < now) {
      continue;
    }

    const bucket = alertsByDestination.get(row.destination_id) ?? [];
    bucket.push({
      source: row.source,
      alertType: row.alert_type,
      severity: row.severity,
      title: row.title,
      description: row.description,
      effectiveDate: row.effective_date,
      expirationDate: row.expiration_date,
    });
    alertsByDestination.set(row.destination_id, bucket);
  }

  for (const [destinationId, alerts] of alertsByDestination) {
    alertsByDestination.set(
      destinationId,
      [...alerts].sort((left, right) => alertSeverityWeight(right) - alertSeverityWeight(left)),
    );
  }

  return alertsByDestination;
}

function mapSnapshotRowToDestination(
  row: DestinationSnapshotRow,
  liveWeather: LiveWeatherSnapshot | null,
  activeAlerts: DestinationAlert[],
): Destination | null {
  const destinationRelation = Array.isArray(row.destination)
    ? row.destination[0]
    : row.destination;

  if (!destinationRelation?.slug) {
    return null;
  }

  const fallback =
    findDestinationBySlug(localDestinations, destinationRelation.slug) ?? localDestinations[0];

  if (!fallback) {
    return null;
  }

  const fitScore = row.current_fit_score ?? fallback.fitScore;
  const fitLabel = row.current_fit_label ?? labelTripFitScore(fitScore);

  return {
    ...fallback,
    slug: destinationRelation.slug,
    name: destinationRelation.name,
    region: destinationRelation.region,
    summary: destinationRelation.summary,
    updatedAt: row.updated_at,
    liveWeather,
    activeAlerts,
    currentVerdict: row.current_verdict ?? fallback.currentVerdict,
    whyNow: row.why_now ?? fallback.whyNow,
    mainWarning: row.main_warning ?? fallback.mainWarning,
    bestActivity: row.best_activity ?? fallback.bestActivity,
    seasonalWindow: row.seasonal_window ?? fallback.seasonalWindow,
    palette:
      row.palette && row.palette.length >= 3
        ? [row.palette[0], row.palette[1], row.palette[2]]
        : fallback.palette,
    driveHours: {
      ...fallback.driveHours,
      ...(row.drive_hours ?? {}),
    },
    idealTripLengths: row.ideal_trip_lengths ?? fallback.idealTripLengths,
    collections: row.collections ?? fallback.collections,
    tags: destinationRelation.tags ?? fallback.tags,
    riskBadges: row.risk_badges ?? fallback.riskBadges,
    breakdown: normalizeBreakdown(row.score_breakdown, fallback.breakdown ?? defaultBreakdown),
    fitScore,
    fitLabel,
    activities: row.activities ?? fallback.activities,
    avoid: fallback.avoid,
    suggestedStops: row.suggested_stops ?? fallback.suggestedStops,
    foodSupport: fallback.foodSupport,
    lodging: row.lodging ?? fallback.lodging,
    planB: fallback.planB,
    itinerary: fallback.itinerary,
  };
}

const getSupabaseDestinations = cache(async (): Promise<Destination[] | null> => {
  if (!hasSupabaseEnv()) {
    return null;
  }

  try {
    const supabase = createPublicServerClient();
    const [snapshotResponse, weatherResponse, alertResponse] = await Promise.all([
      supabase
        .from("destination_content_snapshots")
        .select(
          `
            destination_id,
            current_verdict,
            why_now,
            main_warning,
            best_activity,
            seasonal_window,
            palette,
            drive_hours,
            ideal_trip_lengths,
            collections,
            risk_badges,
            score_breakdown,
            activities,
            avoid_items,
            suggested_stops,
            food_support,
            lodging,
            plan_b,
            itinerary,
            current_fit_score,
            current_fit_label,
            updated_at,
            destination:destinations!inner (
              slug,
              name,
              region,
              summary,
              tags
            )
          `,
        )
        .order("current_fit_score", { ascending: false }),
      supabase
        .from("weather_snapshots")
        .select(
          "destination_id, snapshot_date, high_temp, low_temp, precipitation_probability, wind_speed, snow_risk, heat_risk",
        )
        .order("snapshot_date", { ascending: false }),
      supabase
        .from("alerts")
        .select(
          "destination_id, source, alert_type, severity, title, description, effective_date, expiration_date",
        ),
    ]);

    if (snapshotResponse.error) {
      throw snapshotResponse.error;
    }
    if (weatherResponse.error) {
      throw weatherResponse.error;
    }
    if (alertResponse.error) {
      throw alertResponse.error;
    }

    const weatherByDestination = groupLatestWeatherByDestination(
      (weatherResponse.data ?? []) as WeatherSnapshotRow[],
    );
    const alertsByDestination = groupActiveAlertsByDestination(
      (alertResponse.data ?? []) as AlertRow[],
    );

    const mapped = (snapshotResponse.data ?? [])
      .map((row) =>
        mapSnapshotRowToDestination(
          row as DestinationSnapshotRow,
          weatherByDestination.get((row as DestinationSnapshotRow).destination_id) ?? null,
          alertsByDestination.get((row as DestinationSnapshotRow).destination_id) ?? [],
        ),
      )
      .filter((destination): destination is Destination => Boolean(destination));

    return mapped.length > 0 ? mapped : null;
  } catch (error) {
    console.error("Falling back to local destination dataset.", error);
    return null;
  }
});

export async function getAllDestinations(): Promise<Destination[]> {
  const supabaseDestinations = await getSupabaseDestinations();
  return supabaseDestinations ?? localDestinations;
}

export async function getRankedDestinations(
  origin: Origin,
  tripLength: TripLength,
  context?: RankingContext,
): Promise<RankedDestination[]> {
  const destinationList = await getAllDestinations();
  return rankDestinationList(destinationList, origin, tripLength, context);
}

export async function getDestinationBySlugFromRepository(slug: string) {
  const destinationList = await getAllDestinations();
  return findDestinationBySlug(destinationList, slug);
}

function alertSeverityWeight(alert: DestinationAlert) {
  const normalized = alert.severity.toLowerCase();

  if (normalized.includes("extreme")) {
    return 4;
  }
  if (normalized.includes("severe")) {
    return 3;
  }
  if (normalized.includes("moderate")) {
    return 2;
  }
  if (normalized.includes("minor")) {
    return 1;
  }

  return 0;
}

function maxValue(values: Array<number | null>) {
  const defined = values.filter((value): value is number => value != null);
  return defined.length > 0 ? Math.max(...defined) : null;
}

function roundAverage(values: Array<number | null>) {
  const defined = values.filter((value): value is number => value != null);

  if (defined.length === 0) {
    return null;
  }

  return Math.round(defined.reduce((sum, value) => sum + value, 0) / defined.length);
}
