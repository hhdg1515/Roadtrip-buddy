import { createSupabaseAdminClient } from "./supabase-admin";
import { fetchNpsJson, fetchNwsJson } from "./http";
import { getNpsApiKey } from "./env";
import { destinationSeedMeta } from "../../src/lib/data/openseason-seed-meta";
import {
  destinations as seededDestinations,
  findDestinationBySlug,
  type Destination,
} from "../../src/lib/data/openseason";
import {
  calculateTripFitScore,
  labelTripFitScore,
  type ScoreBreakdown,
} from "../../src/lib/scoring/trip-fit";

type Relation<T> = T | T[] | null;

type DestinationRow = {
  id: string;
  slug: string;
  name: string;
  region: string;
  latitude: number | null;
  longitude: number | null;
  destination_type: string;
  tags: string[] | null;
};

type DestinationAreaRow = {
  id: string;
  destination_id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  elevation_ft: number | null;
  destination: Relation<{
    slug: string;
    name: string;
    destination_type: string;
  }>;
};

type WeatherSnapshotRow = {
  destination_id: string;
  area_id: string | null;
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
  source_id: string | null;
  alert_type: string;
  severity: string;
  title: string;
  description: string | null;
  effective_date: string | null;
  expiration_date: string | null;
};

type SeasonalRuleRow = {
  destination_id: string;
  activity_type: string;
  score: number;
  explanation: string;
  risk_notes: string[] | null;
};

type NwsPointsResponse = {
  properties: {
    forecastHourly: string;
  };
};

type NwsForecastResponse = {
  properties: {
    periods: Array<{
      startTime: string;
      endTime: string;
      temperature: number;
      windSpeed: string;
      shortForecast: string;
      probabilityOfPrecipitation?: {
        value: number | null;
      };
    }>;
  };
};

type NwsAlertResponse = {
  features: Array<{
    id?: string;
    properties?: {
      event?: string | null;
      severity?: string | null;
      headline?: string | null;
      description?: string | null;
      effective?: string | null;
      ends?: string | null;
    };
  }>;
};

type NpsAlertResponse = {
  data?: Array<{
    id?: string | null;
    title?: string | null;
    description?: string | null;
    category?: string | null;
    url?: string | null;
    lastIndexedDate?: string | null;
  }>;
};

type WeatherSummary = {
  highTemp: number;
  lowTemp: number;
  precipitationProbability: number;
  windSpeed: number;
  snowRisk: number;
  heatRisk: number;
};

function unwrapRelation<T>(value: Relation<T>): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function parseWindSpeedMph(input: string) {
  const matches = input.match(/\d+/g);

  if (!matches) {
    return 0;
  }

  return Math.max(...matches.map((value) => Number(value)));
}

function summarizeForecast(
  periods: NwsForecastResponse["properties"]["periods"],
  destinationType: string,
  elevationFt: number | null,
) {
  const now = Date.now();
  const relevantPeriods = periods
    .filter((period) => new Date(period.endTime).getTime() >= now)
    .slice(0, 36);

  if (relevantPeriods.length === 0) {
    return null;
  }

  const temperatures = relevantPeriods.map((period) => period.temperature);
  const precipitationValues = relevantPeriods.map(
    (period) => period.probabilityOfPrecipitation?.value ?? 0,
  );
  const windSpeeds = relevantPeriods.map((period) => parseWindSpeedMph(period.windSpeed));
  const forecastText = relevantPeriods
    .map((period) => period.shortForecast.toLowerCase())
    .join(" ");

  const highTemp = Math.max(...temperatures);
  const lowTemp = Math.min(...temperatures);
  const precipitationProbability = Math.max(...precipitationValues);
  const windSpeed = Math.max(...windSpeeds);

  const isDesert = destinationType.includes("desert");
  const snowKeywordMatch = /\bsnow|sleet|blizzard|ice|wintry|freezing\b/.test(forecastText);
  const snowRiskBase =
    snowKeywordMatch || ((!isDesert && (elevationFt ?? 0) >= 4500 && lowTemp <= 34))
      ? Math.max(40, precipitationProbability)
      : 0;
  const snowRisk = clamp(
    snowRiskBase + (lowTemp <= 32 ? 20 : 0) + ((elevationFt ?? 0) >= 6500 ? 10 : 0),
    0,
    100,
  );

  const heatOffset = isDesert ? 10 : 0;
  const heatRisk = clamp(
    highTemp >= 105 + heatOffset
      ? 95
      : highTemp >= 95 + heatOffset
        ? 78
        : highTemp >= 85 + heatOffset
          ? 45
          : 10,
    0,
    100,
  );

  return {
    highTemp,
    lowTemp,
    precipitationProbability,
    windSpeed,
    snowRisk,
    heatRisk,
  } satisfies WeatherSummary;
}

function computeWeatherScore(destination: Destination, weather: WeatherSummary | null) {
  if (!weather) {
    return destination.breakdown.weather;
  }

  const isDesert = destination.slug === "death-valley";
  let score = 92;

  if (weather.precipitationProbability >= 70) {
    score -= 20;
  } else if (weather.precipitationProbability >= 40) {
    score -= 10;
  }

  if (weather.windSpeed >= 35) {
    score -= 18;
  } else if (weather.windSpeed >= 25) {
    score -= 8;
  }

  score -= Math.round(Math.max(0, weather.snowRisk - 20) * 0.35);
  score -= Math.round(Math.max(0, weather.heatRisk - 20) * 0.28);

  if (!isDesert && weather.highTemp > 88) {
    score -= 8;
  }

  if (isDesert && weather.highTemp > 95) {
    score -= 10;
  }

  return clamp(score, 24, 96);
}

function severityPenalty(severity: string) {
  const normalized = severity.toLowerCase();

  if (normalized.includes("extreme")) {
    return 28;
  }
  if (normalized.includes("severe")) {
    return 20;
  }
  if (normalized.includes("moderate")) {
    return 12;
  }
  if (normalized.includes("minor")) {
    return 6;
  }

  return 4;
}

function computeAlertScore(alerts: AlertRow[], destination: Destination) {
  if (alerts.length === 0) {
    return clamp(destination.breakdown.alerts + 6, 35, 96);
  }

  let score = 92;

  for (const alert of alerts) {
    score -= severityPenalty(alert.severity);

    const title = `${alert.alert_type} ${alert.title}`.toLowerCase();
    if (/\bclosed|closure|road closed|fire|flood|evac|heat advisory|winter storm\b/.test(title)) {
      score -= 6;
    }
  }

  return clamp(score, 18, 92);
}

function alertSortWeight(alert: AlertRow) {
  return severityPenalty(alert.severity);
}

function getPrimaryAlert(alerts: AlertRow[]) {
  return [...alerts].sort((left, right) => alertSortWeight(right) - alertSortWeight(left))[0];
}

function deriveRiskBadges(
  destination: Destination,
  weather: WeatherSummary | null,
  alerts: AlertRow[],
) {
  const badges = new Set(destination.riskBadges);

  if (weather) {
    if (weather.heatRisk >= 65) {
      badges.add("Heat risk");
    }
    if (weather.snowRisk >= 55) {
      badges.add("Snow risk");
    }
    if (weather.windSpeed >= 25) {
      badges.add("Wind risk");
    }
    if (weather.precipitationProbability >= 60) {
      badges.add("Storm risk");
    }
  }

  for (const alert of alerts) {
    const title = `${alert.alert_type} ${alert.title}`.toLowerCase();

    if (/\bclosed|closure|road closed\b/.test(title)) {
      badges.add("Road closure risk");
    }
    if (/\bfire|smoke\b/.test(title)) {
      badges.add("Fire/smoke risk");
    }
    if (/\bheat\b/.test(title)) {
      badges.add("Heat risk");
    }
    if (/\bsnow|winter|ice\b/.test(title)) {
      badges.add("Snow risk");
    }
    if (/\bwind\b/.test(title)) {
      badges.add("Wind risk");
    }
    if (/\bflood|rain|storm\b/.test(title)) {
      badges.add("Storm risk");
    }
  }

  return [...badges].slice(0, 6);
}

function buildWeatherSentence(weather: WeatherSummary | null) {
  if (!weather) {
    return "Live weather data is temporarily unavailable, so this snapshot leans on seeded guidance.";
  }

  return `Forecast highs are near ${weather.highTemp}F with lows around ${weather.lowTemp}F, max precipitation risk near ${weather.precipitationProbability}%, and winds up to ${weather.windSpeed} mph.`;
}

function buildAlertSentence(alerts: AlertRow[]) {
  if (alerts.length === 0) {
    return "No active NWS or park alerts are currently being tracked for this destination.";
  }

  const primaryAlert = getPrimaryAlert(alerts);
  return `${alerts.length} active alert${alerts.length > 1 ? "s are" : " is"} being tracked, led by "${primaryAlert?.title ?? primaryAlert?.alert_type ?? "current alert"}".`;
}

function buildMainWarning(
  destination: Destination,
  weather: WeatherSummary | null,
  alerts: AlertRow[],
) {
  const primaryAlert = getPrimaryAlert(alerts);

  if (primaryAlert) {
    return primaryAlert.title;
  }

  if (weather?.heatRisk && weather.heatRisk >= 65) {
    return `Heat is climbing into a range that can reduce casual-trip comfort for ${destination.name}.`;
  }

  if (weather?.snowRisk && weather.snowRisk >= 55) {
    return `Snow and freezing exposure still matter enough to shape route choice for ${destination.name}.`;
  }

  if (weather?.windSpeed && weather.windSpeed >= 25) {
    return `Wind is strong enough to make exposed stops and viewpoints less reliable than usual.`;
  }

  return destination.mainWarning;
}

function buildWhyNow(
  destination: Destination,
  seasonalityExplanation: string | null,
  weather: WeatherSummary | null,
  alerts: AlertRow[],
) {
  const parts = [seasonalityExplanation ?? destination.whyNow, buildWeatherSentence(weather)];

  if (alerts.length === 0) {
    parts.push("Alert pressure is currently light, which helps preserve the base itinerary.");
  } else {
    parts.push(buildAlertSentence(alerts));
  }

  return parts.join(" ");
}

function buildCurrentVerdict(
  destination: Destination,
  fitLabel: string,
  weather: WeatherSummary | null,
  alerts: AlertRow[],
) {
  const lead =
    fitLabel === "Excellent now"
      ? "Strong current pick."
      : fitLabel === "Good with caution"
        ? "Still workable, but some caution is justified."
        : fitLabel === "Mixed conditions"
          ? "Conditions are mixed enough that tradeoffs are obvious."
          : "This is currently a weak fit unless your constraints are very specific.";

  if (alerts.length > 0) {
    const primaryAlert = getPrimaryAlert(alerts);
    return `${lead} The main trip-shaping issue right now is ${primaryAlert?.title ?? "an active alert"}.`;
  }

  if (weather) {
    return `${lead} Weather is currently pointing to highs near ${weather.highTemp}F and lows near ${weather.lowTemp}F.`;
  }

  return `${lead} Live conditions have not been ingested yet, so the seeded verdict remains in effect.`;
}

function buildDynamicAvoidItems(
  destination: Destination,
  weather: WeatherSummary | null,
  alerts: AlertRow[],
) {
  const dynamicItems: string[] = [];

  if (weather?.heatRisk && weather.heatRisk >= 65) {
    dynamicItems.push("Avoid exposed midday blocks if heat continues to climb.");
  }

  if (weather?.snowRisk && weather.snowRisk >= 55) {
    dynamicItems.push("Avoid assuming higher-elevation access is straightforward without a snow check.");
  }

  if (weather?.windSpeed && weather.windSpeed >= 25) {
    dynamicItems.push("Avoid overcommitting to exposed viewpoints or long wind-sensitive stops.");
  }

  for (const alert of alerts.slice(0, 2)) {
    dynamicItems.push(`Check "${alert.title}" before departure.`);
  }

  return unique([...dynamicItems, ...destination.avoid]).slice(0, 5);
}

async function getDestinationRows() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("destinations")
    .select("id, slug, name, region, latitude, longitude, destination_type, tags");

  if (error) {
    throw error;
  }

  return (data ?? []) as DestinationRow[];
}

export async function syncWeatherSnapshots() {
  const supabase = createSupabaseAdminClient();
  const snapshotDate = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("destination_areas")
    .select(
      `
        id,
        destination_id,
        name,
        latitude,
        longitude,
        elevation_ft,
        destination:destinations!inner (
          slug,
          name,
          destination_type
        )
      `,
    );

  if (error) {
    throw error;
  }

  const areas = (data ?? []) as DestinationAreaRow[];
  let synced = 0;

  for (const area of areas) {
    const destination = unwrapRelation(area.destination);

    if (!destination || area.latitude == null || area.longitude == null) {
      continue;
    }

    try {
      const points = await fetchNwsJson<NwsPointsResponse>(
        `https://api.weather.gov/points/${area.latitude},${area.longitude}`,
      );
      const hourly = await fetchNwsJson<NwsForecastResponse>(points.properties.forecastHourly);
      const summary = summarizeForecast(
        hourly.properties.periods,
        destination.destination_type,
        area.elevation_ft,
      );

      if (!summary) {
        continue;
      }

      const { error: upsertError } = await supabase.from("weather_snapshots").upsert(
        {
          destination_id: area.destination_id,
          area_id: area.id,
          snapshot_date: snapshotDate,
          high_temp: summary.highTemp,
          low_temp: summary.lowTemp,
          precipitation_probability: summary.precipitationProbability,
          wind_speed: summary.windSpeed,
          snow_risk: summary.snowRisk,
          heat_risk: summary.heatRisk,
        },
        {
          onConflict: "destination_id,area_id,snapshot_date",
        },
      );

      if (upsertError) {
        throw upsertError;
      }

      synced += 1;
    } catch (error) {
      console.warn(`Skipping weather sync for ${destination.slug}:`, error);
    }
  }

  return { synced, snapshotDate };
}

export async function syncAlerts() {
  const supabase = createSupabaseAdminClient();
  const destinations = await getDestinationRows();
  const rowsToInsert: AlertRow[] = [];

  const destinationIds = destinations.map((destination) => destination.id);
  if (destinationIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("alerts")
      .delete()
      .in("destination_id", destinationIds)
      .in("source", ["nws", "nps"]);

    if (deleteError) {
      throw deleteError;
    }
  }

  for (const destination of destinations) {
    if (destination.latitude != null && destination.longitude != null) {
      try {
        const nwsAlerts = await fetchNwsJson<NwsAlertResponse>(
          `https://api.weather.gov/alerts/active?point=${destination.latitude},${destination.longitude}`,
        );

        rowsToInsert.push(
          ...nwsAlerts.features.map((feature) => ({
            destination_id: destination.id,
            source: "nws",
            source_id: feature.id ?? null,
            alert_type: feature.properties?.event ?? "Weather Alert",
            severity: feature.properties?.severity ?? "Unknown",
            title: feature.properties?.headline ?? feature.properties?.event ?? "Weather Alert",
            description: feature.properties?.description ?? null,
            effective_date: feature.properties?.effective ?? null,
            expiration_date: feature.properties?.ends ?? null,
          })),
        );
      } catch (error) {
        console.warn(`Skipping NWS alerts for ${destination.slug}:`, error);
      }
    }

    const npsParkCode =
      destinationSeedMeta[destination.slug as keyof typeof destinationSeedMeta]?.npsParkCode;

    if (npsParkCode && getNpsApiKey()) {
      try {
        const npsAlerts = await fetchNpsJson<NpsAlertResponse>(
          `https://developer.nps.gov/api/v1/alerts?parkCode=${npsParkCode}&limit=20`,
        );

        rowsToInsert.push(
          ...(npsAlerts.data ?? []).map((alert) => {
            const alertText = `${alert.title ?? ""} ${alert.description ?? ""}`.toLowerCase();
            const severity = /\bclosure|closed|fire|flood\b/.test(alertText)
              ? "Severe"
              : /\bcaution|danger|winter|heat\b/.test(alertText)
                ? "Moderate"
                : "Minor";

            return {
              destination_id: destination.id,
              source: "nps",
              source_id: alert.id ?? alert.url ?? null,
              alert_type: alert.category ?? "Park Alert",
              severity,
              title: alert.title ?? "Park Alert",
              description: alert.description ?? null,
              effective_date: alert.lastIndexedDate ?? null,
              expiration_date: null,
            } satisfies AlertRow;
          }),
        );
      } catch (error) {
        console.warn(`Skipping NPS alerts for ${destination.slug}:`, error);
      }
    }
  }

  if (rowsToInsert.length > 0) {
    const { error: insertError } = await supabase.from("alerts").insert(rowsToInsert);

    if (insertError) {
      throw insertError;
    }
  }

  return {
    synced: rowsToInsert.length,
    nwsCount: rowsToInsert.filter((row) => row.source === "nws").length,
    npsCount: rowsToInsert.filter((row) => row.source === "nps").length,
  };
}

export async function refreshDestinationSnapshots() {
  const supabase = createSupabaseAdminClient();
  const now = new Date();
  const month = now.getMonth() + 1;
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [destinationRows, weatherRowsResponse, alertRowsResponse, seasonalRulesResponse] =
    await Promise.all([
      getDestinationRows(),
      supabase
        .from("weather_snapshots")
        .select(
          "destination_id, area_id, snapshot_date, high_temp, low_temp, precipitation_probability, wind_speed, snow_risk, heat_risk",
        )
        .gte("snapshot_date", sevenDaysAgo.toISOString().slice(0, 10))
        .order("snapshot_date", { ascending: false }),
      supabase
        .from("alerts")
        .select(
          "destination_id, source, source_id, alert_type, severity, title, description, effective_date, expiration_date",
        ),
      supabase
        .from("seasonal_rules")
        .select("destination_id, activity_type, score, explanation, risk_notes")
        .eq("month", month),
    ]);

  if (weatherRowsResponse.error) {
    throw weatherRowsResponse.error;
  }
  if (alertRowsResponse.error) {
    throw alertRowsResponse.error;
  }
  if (seasonalRulesResponse.error) {
    throw seasonalRulesResponse.error;
  }

  const latestWeatherByDestination = new Map<string, WeatherSnapshotRow>();
  for (const row of (weatherRowsResponse.data ?? []) as WeatherSnapshotRow[]) {
    if (!latestWeatherByDestination.has(row.destination_id)) {
      latestWeatherByDestination.set(row.destination_id, row);
    }
  }

  const activeAlertsByDestination = new Map<string, AlertRow[]>();
  for (const row of (alertRowsResponse.data ?? []) as AlertRow[]) {
    const expiration =
      row.expiration_date == null ? null : new Date(row.expiration_date).getTime();
    if (expiration != null && expiration < now.getTime()) {
      continue;
    }

    const bucket = activeAlertsByDestination.get(row.destination_id) ?? [];
    bucket.push(row);
    activeAlertsByDestination.set(row.destination_id, bucket);
  }

  const seasonalityByDestination = new Map<string, SeasonalRuleRow>();
  for (const row of (seasonalRulesResponse.data ?? []) as SeasonalRuleRow[]) {
    const current = seasonalityByDestination.get(row.destination_id);
    if (!current || row.score > current.score) {
      seasonalityByDestination.set(row.destination_id, row);
    }
  }

  const snapshotRows = destinationRows
    .map((destinationRow) => {
      const seeded = findDestinationBySlug(seededDestinations, destinationRow.slug);

      if (!seeded) {
        return null;
      }

      const weatherRow = latestWeatherByDestination.get(destinationRow.id);
      const weather = weatherRow
        ? {
            highTemp: weatherRow.high_temp ?? 0,
            lowTemp: weatherRow.low_temp ?? 0,
            precipitationProbability: weatherRow.precipitation_probability ?? 0,
            windSpeed: weatherRow.wind_speed ?? 0,
            snowRisk: weatherRow.snow_risk ?? 0,
            heatRisk: weatherRow.heat_risk ?? 0,
          }
        : null;
      const alerts = activeAlertsByDestination.get(destinationRow.id) ?? [];
      const seasonalRule = seasonalityByDestination.get(destinationRow.id);

      const breakdown: ScoreBreakdown = {
        ...seeded.breakdown,
        seasonality: seasonalRule?.score ?? seeded.breakdown.seasonality,
        weather: computeWeatherScore(seeded, weather),
        alerts: computeAlertScore(alerts, seeded),
      };

      const fitScore = calculateTripFitScore(breakdown);
      const fitLabel = labelTripFitScore(fitScore);

      return {
        destination_id: destinationRow.id,
        current_verdict: buildCurrentVerdict(seeded, fitLabel, weather, alerts),
        why_now: buildWhyNow(seeded, seasonalRule?.explanation ?? null, weather, alerts),
        main_warning: buildMainWarning(seeded, weather, alerts),
        best_activity: seeded.bestActivity,
        seasonal_window: seeded.seasonalWindow,
        palette: seeded.palette,
        drive_hours: seeded.driveHours,
        ideal_trip_lengths: seeded.idealTripLengths,
        collections: seeded.collections,
        risk_badges: deriveRiskBadges(seeded, weather, alerts),
        score_breakdown: breakdown,
        activities: seeded.activities,
        avoid_items: buildDynamicAvoidItems(seeded, weather, alerts),
        suggested_stops: seeded.suggestedStops,
        food_support: seeded.foodSupport,
        lodging: seeded.lodging,
        plan_b: seeded.planB,
        itinerary: seeded.itinerary,
        current_fit_score: fitScore,
        current_fit_label: fitLabel,
        updated_at: now.toISOString(),
      };
    })
    .filter(Boolean);

  if (snapshotRows.length > 0) {
    const { error: upsertError } = await supabase
      .from("destination_content_snapshots")
      .upsert(snapshotRows, { onConflict: "destination_id" });

    if (upsertError) {
      throw upsertError;
    }
  }

  return { refreshed: snapshotRows.length, month };
}
