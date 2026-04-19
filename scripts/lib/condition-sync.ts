import { createSupabaseAdminClient } from "./supabase-admin";
import { fetchArcgisJson, fetchCaltransJson, fetchHtml, fetchNpsJson, fetchNwsJson } from "./http";
import { getNpsApiKey } from "./env";
import { mapUsfsSeverity, parseUsfsAlertsPage, selectRelevantUsfsAlerts } from "./usfs-alerts";
import {
  mapUsfsConditionSeverity,
  parseUsfsConditionsPage,
  selectRelevantUsfsConditionLines,
} from "./usfs-conditions";
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
import { getDecisionStatus } from "../../src/lib/decision-layer";

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

type CaltransLaneClosureResponse = {
  data?: Array<{
    lcs?: {
      index?: string;
      recordTimestamp?: {
        recordEpoch?: string;
      };
      location?: {
        travelFlowDirection?: string;
        begin?: {
          beginNearbyPlace?: string;
          beginLongitude?: string;
          beginLatitude?: string;
          beginCounty?: string;
          beginRoute?: string;
          beginRouteSuffix?: string;
          beginFreeFormDescription?: string;
        };
        end?: {
          endNearbyPlace?: string;
          endLongitude?: string;
          endLatitude?: string;
          endCounty?: string;
          endRoute?: string;
          endRouteSuffix?: string;
          endFreeFormDescription?: string;
        };
      };
      closure?: {
        closureTimestamp?: {
          closureStartEpoch?: string;
          closureEndEpoch?: string;
          isClosureEndIndefinite?: string;
        };
        facility?: string;
        typeOfClosure?: string;
        typeOfWork?: string;
        durationOfClosure?: string;
        estimatedDelay?: string;
        lanesClosed?: string;
        totalExistingLanes?: string;
        isCHINReportable?: string;
        code1097?: {
          isCode1097?: string;
        };
        code1098?: {
          isCode1098?: string;
        };
        code1022?: {
          isCode1022?: string;
        };
      };
    };
  }>;
};

type CaltransClosure = NonNullable<
  NonNullable<CaltransLaneClosureResponse["data"]>[number]["lcs"]
>;

type ArcgisFeatureResponse<TAttributes> = {
  features?: Array<{
    attributes?: TAttributes;
    geometry?: {
      x?: number;
      y?: number;
    };
  }>;
};

type WfigsIncidentAttributes = {
  IncidentName?: string | null;
  IncidentShortDescription?: string | null;
  UniqueFireIdentifier?: string | null;
  IrwinID?: string | null;
  SourceGlobalID?: string | null;
  POOCounty?: string | null;
  POOState?: string | null;
  PercentContained?: number | null;
  IncidentSize?: number | null;
  FireDiscoveryDateTime?: number | null;
  ModifiedOnDateTime_dt?: number | null;
  FireOutDateTime?: number | null;
};

type WfigsIncidentResponse = ArcgisFeatureResponse<WfigsIncidentAttributes>;

type WfigsIncident = {
  sourceId: string;
  name: string;
  description: string | null;
  county: string | null;
  percentContained: number | null;
  sizeAcres: number | null;
  discoveryDate: string | null;
  modifiedDate: string | null;
  latitude: number;
  longitude: number;
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

const californiaWildfireQueryUrl = (() => {
  const query = new URLSearchParams({
    where: "POOState = 'US-CA' AND IncidentTypeCategory = 'WF'",
    outFields:
      "IncidentName,IncidentShortDescription,UniqueFireIdentifier,IrwinID,SourceGlobalID,POOCounty,POOState,PercentContained,IncidentSize,FireDiscoveryDateTime,ModifiedOnDateTime_dt,FireOutDateTime",
    returnGeometry: "true",
    outSR: "4326",
    f: "json",
  });

  return `https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Incident_Locations_Current/FeatureServer/0/query?${query.toString()}`;
})();

function toBooleanFlag(value: string | null | undefined) {
  return value?.toLowerCase() === "true";
}

function parseEpoch(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const numeric = Number(value);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }

  return numeric < 1_000_000_000_000 ? numeric * 1000 : numeric;
}

function epochToIso(value: number | null) {
  return value == null ? null : new Date(value).toISOString();
}

function parseNumber(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (!value) {
    return null;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function haversineMiles(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const deltaLatitude = toRadians(latitudeB - latitudeA);
  const deltaLongitude = toRadians(longitudeB - longitudeA);
  const startLatitude = toRadians(latitudeA);
  const endLatitude = toRadians(latitudeB);
  const arc =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(deltaLongitude / 2) ** 2;

  return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
}

function normalizeRoute(route: string | null | undefined, suffix: string | null | undefined = "") {
  const raw = route?.trim().toUpperCase();

  if (!raw) {
    return null;
  }

  const normalizedBase = /^\d+$/.test(raw) ? `SR-${raw}` : raw;
  const normalizedSuffix = suffix?.trim().toUpperCase() ?? "";

  return `${normalizedBase}${normalizedSuffix}`.replace(/\s+/g, "");
}

function getClosureDistanceMiles(destination: DestinationRow, closure: CaltransClosure) {
  if (destination.latitude == null || destination.longitude == null) {
    return null;
  }

  const points = [
    {
      latitude: parseNumber(closure.location?.begin?.beginLatitude),
      longitude: parseNumber(closure.location?.begin?.beginLongitude),
    },
    {
      latitude: parseNumber(closure.location?.end?.endLatitude),
      longitude: parseNumber(closure.location?.end?.endLongitude),
    },
  ].filter((point): point is { latitude: number; longitude: number } => {
    return point.latitude != null && point.longitude != null;
  });

  if (points.length === 0) {
    return null;
  }

  return Math.min(
    ...points.map((point) =>
      haversineMiles(destination.latitude!, destination.longitude!, point.latitude, point.longitude),
    ),
  );
}

function isActiveCaltransClosure(closure: CaltransClosure, nowEpoch: number) {
  const startEpoch = parseEpoch(closure.closure?.closureTimestamp?.closureStartEpoch);
  const endEpoch = parseEpoch(closure.closure?.closureTimestamp?.closureEndEpoch);
  const started = toBooleanFlag(closure.closure?.code1097?.isCode1097) || (startEpoch != null && startEpoch <= nowEpoch);
  const ended = toBooleanFlag(closure.closure?.code1098?.isCode1098);
  const cancelled = toBooleanFlag(closure.closure?.code1022?.isCode1022);
  const indefinite = toBooleanFlag(closure.closure?.closureTimestamp?.isClosureEndIndefinite);

  if (cancelled || ended || !started) {
    return false;
  }

  if (!indefinite && endEpoch != null && endEpoch < nowEpoch) {
    return false;
  }

  return true;
}

function matchesCaltransWatch(
  destination: DestinationRow,
  watch: NonNullable<(typeof destinationSeedMeta)[keyof typeof destinationSeedMeta]["caltransWatch"]>,
  closure: CaltransClosure,
) {
  const route = normalizeRoute(
    closure.location?.begin?.beginRoute ?? closure.location?.end?.endRoute,
    closure.location?.begin?.beginRouteSuffix ?? closure.location?.end?.endRouteSuffix,
  );
  const watchedRoutes = watch.routes?.map((value) => normalizeRoute(value, "")) ?? [];
  const routeMatch = watchedRoutes.length === 0 ? true : (route != null && watchedRoutes.includes(route));
  const countyText = `${closure.location?.begin?.beginCounty ?? ""} ${closure.location?.end?.endCounty ?? ""}`.toLowerCase();
  const countyMatch =
    watch.counties == null || watch.counties.length === 0
      ? true
      : watch.counties.some((county) => countyText.includes(county.toLowerCase()));
  const hintText = `${closure.location?.begin?.beginNearbyPlace ?? ""} ${closure.location?.end?.endNearbyPlace ?? ""} ${closure.location?.begin?.beginFreeFormDescription ?? ""} ${closure.location?.end?.endFreeFormDescription ?? ""}`.toLowerCase();
  const hintMatch =
    watch.corridorHints == null || watch.corridorHints.length === 0
      ? true
      : watch.corridorHints.some((hint) => hintText.includes(hint.toLowerCase()));
  const distanceMiles = getClosureDistanceMiles(destination, closure);
  const withinDistance =
    distanceMiles == null ? true : distanceMiles <= (watch.maxDistanceMiles ?? 50);

  return routeMatch && withinDistance && countyMatch && hintMatch;
}

function inferCaltransSeverity(closure: CaltransClosure) {
  const closureType = closure.closure?.typeOfClosure?.toLowerCase() ?? "";
  const workType = closure.closure?.typeOfWork?.toLowerCase() ?? "";
  const duration = closure.closure?.durationOfClosure?.toLowerCase() ?? "";
  const delayMinutes = parseNumber(closure.closure?.estimatedDelay);

  if (
    /\bfull\b/.test(closureType) ||
    /\bslide|washout|bridge|rock|emergency|fire\b/.test(workType) ||
    delayMinutes != null && delayMinutes >= 30 ||
    duration.includes("long term")
  ) {
    return "Severe";
  }

  if (
    /\bone-way|lane|alternating|traffic\b/.test(closureType) ||
    /\bguardrail|utility|drainage|paving\b/.test(workType) ||
    (delayMinutes != null && delayMinutes >= 10)
  ) {
    return "Moderate";
  }

  return "Minor";
}

function formatWildfireDistance(distanceMiles: number) {
  return `${Math.round(distanceMiles)} miles`;
}

function formatWildfireAcres(acres: number | null) {
  if (acres == null || acres <= 0) {
    return null;
  }

  return `${Math.round(acres).toLocaleString()} acres`;
}

function wildfireRadiusMilesForDestination(destination: DestinationRow) {
  const type = destination.destination_type.toLowerCase();

  if (/\bisland|coast|seashore|monument\b/.test(type)) {
    return 75;
  }

  if (/\bforest|mountain|park|volcanic|desert|lake\b/.test(type)) {
    return 110;
  }

  return 90;
}

function inferWildfireSeverity(
  distanceMiles: number,
  acres: number | null,
  percentContained: number | null,
) {
  let score = 0;

  if (distanceMiles <= 15) {
    score += 4;
  } else if (distanceMiles <= 30) {
    score += 3;
  } else if (distanceMiles <= 50) {
    score += 2;
  } else if (distanceMiles <= 80) {
    score += 1;
  }

  if ((acres ?? 0) >= 25_000) {
    score += 3;
  } else if ((acres ?? 0) >= 10_000) {
    score += 2;
  } else if ((acres ?? 0) >= 1_000) {
    score += 1;
  }

  if (percentContained == null) {
    if (distanceMiles <= 15 || (acres ?? 0) >= 1_000) {
      score += 1;
    }
  } else if (percentContained < 20) {
    score += 2;
  } else if (percentContained < 60) {
    score += 1;
  }

  if (score >= 6) {
    return "Severe";
  }

  if (score >= 3) {
    return "Moderate";
  }

  return "Minor";
}

function shouldTrackWildfireIncident(incident: WfigsIncident, distanceMiles: number) {
  const acres = incident.sizeAcres;

  if (acres != null && acres < 1 && distanceMiles > 20) {
    return false;
  }

  if (acres == null && incident.percentContained == null && distanceMiles > 35) {
    return false;
  }

  if (acres == null && distanceMiles > 60 && (incident.percentContained == null || incident.percentContained >= 80)) {
    return false;
  }

  if (distanceMiles > 80 && (acres ?? 0) < 1_000) {
    return false;
  }

  return true;
}

function isLowSignalWildfireName(name: string) {
  return /^[A-Z]{2,6}-\d+$/i.test(name) || name.includes("/");
}

function buildWildfireLabelName(incident: WfigsIncident) {
  if (isLowSignalWildfireName(incident.name) && incident.county) {
    return `${incident.county} County`;
  }

  return incident.name;
}

function buildWildfireTitle(incident: WfigsIncident, distanceMiles: number) {
  return `Nearby wildfire: ${buildWildfireLabelName(incident)} (${formatWildfireDistance(distanceMiles)} away)`;
}

function buildWildfireDescription(
  destination: DestinationRow,
  incident: WfigsIncident,
  distanceMiles: number,
) {
  const parts = [
    `${incident.name} is an active wildfire roughly ${formatWildfireDistance(distanceMiles)} from ${destination.name}.`,
  ];
  const context: string[] = [];

  if (incident.county) {
    context.push(`${incident.county} County`);
  }

  const acres = formatWildfireAcres(incident.sizeAcres);
  if (acres) {
    context.push(acres);
  }

  if (incident.percentContained != null) {
    context.push(`${Math.round(incident.percentContained)}% contained`);
  }

  if (context.length > 0) {
    parts.push(`Current incident context: ${context.join(", ")}.`);
  }

  if (buildWildfireLabelName(incident) !== incident.name) {
    parts.push(`Official incident label: ${incident.name}.`);
  }

  if (incident.description) {
    parts.push(incident.description);
  }

  return parts.join(" ");
}

function normalizeWfigsIncident(
  feature: NonNullable<WfigsIncidentResponse["features"]>[number],
): WfigsIncident | null {
  const attributes = feature.attributes;

  if (!attributes) {
    return null;
  }

  const latitude = feature.geometry?.y ?? null;
  const longitude = feature.geometry?.x ?? null;
  const sourceId =
    attributes.UniqueFireIdentifier ??
    attributes.IrwinID ??
    attributes.SourceGlobalID ??
    null;
  const name = attributes.IncidentName?.trim() ?? "";

  if (!sourceId || !name || latitude == null || longitude == null || attributes.FireOutDateTime) {
    return null;
  }

  return {
    sourceId,
    name,
    description: attributes.IncidentShortDescription?.trim() || null,
    county: attributes.POOCounty?.trim() || null,
    percentContained: attributes.PercentContained ?? null,
    sizeAcres: attributes.IncidentSize ?? null,
    discoveryDate: epochToIso(parseNumber(attributes.FireDiscoveryDateTime)),
    modifiedDate: epochToIso(parseNumber(attributes.ModifiedOnDateTime_dt)),
    latitude,
    longitude,
  };
}

async function fetchCaliforniaWildfires() {
  const response = await fetchArcgisJson<WfigsIncidentResponse>(californiaWildfireQueryUrl);

  return (response.features ?? [])
    .map((feature) => normalizeWfigsIncident(feature))
    .filter((incident): incident is WfigsIncident => incident != null);
}

function formatCaltransTitle(closure: CaltransClosure) {
  const route =
    normalizeRoute(
      closure.location?.begin?.beginRoute ?? closure.location?.end?.endRoute,
      closure.location?.begin?.beginRouteSuffix ?? closure.location?.end?.endRouteSuffix,
    ) ?? "Route access";
  const nearbyPlace =
    closure.location?.begin?.beginNearbyPlace ||
    closure.location?.end?.endNearbyPlace ||
    closure.location?.begin?.beginCounty ||
    closure.location?.end?.endCounty ||
    "current access point";
  const closureType = closure.closure?.typeOfClosure ?? "closure";

  return `${route} ${closureType} near ${nearbyPlace}`;
}

function formatCaltransDescription(closure: CaltransClosure) {
  const beginDescription =
    closure.location?.begin?.beginFreeFormDescription ||
    closure.location?.begin?.beginNearbyPlace ||
    closure.location?.begin?.beginCounty ||
    "the start of the segment";
  const endDescription =
    closure.location?.end?.endFreeFormDescription ||
    closure.location?.end?.endNearbyPlace ||
    closure.location?.end?.endCounty ||
    "the end of the segment";
  const route =
    normalizeRoute(
      closure.location?.begin?.beginRoute ?? closure.location?.end?.endRoute,
      closure.location?.begin?.beginRouteSuffix ?? closure.location?.end?.endRouteSuffix,
    ) ?? "This route";
  const workType = closure.closure?.typeOfWork ?? "road work";
  const duration = closure.closure?.durationOfClosure ?? "Current";
  const delayMinutes = parseNumber(closure.closure?.estimatedDelay);
  const direction = closure.location?.travelFlowDirection ? `${closure.location.travelFlowDirection.toLowerCase()}bound` : "travel";
  const parts = [
    `${workType} is affecting ${direction} travel on ${route} from ${beginDescription} to ${endDescription}.`,
    `${duration} closure pattern.`,
  ];

  if (delayMinutes != null) {
    parts.push(`Estimated delay is about ${delayMinutes} minutes.`);
  } else if (
    closure.closure?.estimatedDelay &&
    closure.closure.estimatedDelay.toLowerCase() !== "not reported"
  ) {
    parts.push(`Estimated delay: ${closure.closure.estimatedDelay}.`);
  }

  return parts.join(" ");
}

function isRouteAccessAlert(alert: AlertRow) {
  const text = `${alert.alert_type} ${alert.title} ${alert.description ?? ""}`.toLowerCase();
  return (
    alert.source === "caltrans" ||
    /\bclosed|closure|road closed|lane|one-way traffic|chain control|slide|washout|highway\b/.test(
      text,
    )
  );
}

function isFireOrSmokeAlert(alert: AlertRow) {
  const text = `${alert.alert_type} ${alert.title} ${alert.description ?? ""}`.toLowerCase();
  return alert.source === "wfigs" || /\bfire|wildfire|smoke|evacuat|red flag\b/.test(text);
}

function getRouteAccessAlert(alerts: AlertRow[]) {
  return alerts
    .filter(isRouteAccessAlert)
    .sort((left, right) => alertSortWeight(right) - alertSortWeight(left))[0];
}

function getFireOrSmokeAlert(alerts: AlertRow[]) {
  return alerts
    .filter(isFireOrSmokeAlert)
    .sort((left, right) => alertSortWeight(right) - alertSortWeight(left))[0];
}

function joinWithAnd(values: string[]) {
  if (values.length === 0) {
    return "";
  }

  if (values.length === 1) {
    return values[0]!;
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
}

function parseEstimatedDelayMinutes(alert: AlertRow) {
  const match = `${alert.title} ${alert.description ?? ""}`.match(/(\d+)\s*minutes?/i);
  return match ? Number(match[1]) : null;
}

function buildRouteFallbackAlternative(destination: Destination) {
  const meta = destinationSeedMeta[destination.slug as keyof typeof destinationSeedMeta];
  const anchor = destination.lodging.bestBase || destination.foodSupport.nearbyTown;
  const coreStops = destination.suggestedStops.slice(0, 3);
  const stopSummary = joinWithAnd(coreStops);

  if (meta?.destinationType.includes("desert")) {
    return `Shift to an early and late loop around ${anchor}${stopSummary ? ` with ${stopSummary}` : ""} instead of forcing the most remote segment.`;
  }

  if (
    meta?.destinationType.includes("coast") ||
    meta?.destinationType.includes("seashore") ||
    meta?.destinationType.includes("island")
  ) {
    return `Keep the trip anchored around ${anchor}${stopSummary ? ` and ${stopSummary}` : ""} instead of forcing the full coastal corridor.`;
  }

  return `Base out of ${anchor}${stopSummary ? ` and keep the trip to lower-friction stops like ${stopSummary}` : ""} instead of forcing the full access loop.`;
}

function buildWeatherFallbackAlternative(destination: Destination, mode: "heat" | "snow" | "wind") {
  const anchor = destination.lodging.bestBase || destination.foodSupport.nearbyTown;
  const town = destination.foodSupport.nearbyTown;
  const primaryStops = joinWithAnd(destination.suggestedStops.slice(0, 2));

  if (mode === "heat") {
    return `Front-load one outdoor block near ${primaryStops || anchor}, take the long midday reset in ${town}, then use one shorter sunset stop instead of forcing the full daytime itinerary.`;
  }

  if (mode === "snow") {
    return `Keep the trip to lower-elevation access near ${anchor}${primaryStops ? ` and ${primaryStops}` : ""} instead of forcing the highest road segment.`;
  }

  return `Bias the day toward sheltered stops near ${anchor}${primaryStops ? ` and ${primaryStops}` : ""}, and only keep one exposed viewpoint block if conditions still feel worth it.`;
}

function buildFireFallbackAlternative(destination: Destination) {
  const anchor = destination.lodging.bestBase || destination.foodSupport.nearbyTown;
  const town = destination.foodSupport.nearbyTown;
  const shortStops = joinWithAnd(destination.suggestedStops.slice(0, 2));

  return `Keep the trip anchored around ${anchor}${shortStops ? ` with a shorter loop through ${shortStops}` : ""}, and let ${town} carry the food and reset time instead of forcing the deepest or most exposed segment.`;
}

function buildDynamicPlanB(destination: Destination, weather: WeatherSummary | null, alerts: AlertRow[]) {
  const seededPlan = destination.planB;
  const routeAlert = getRouteAccessAlert(alerts);
  const fireAlert = getFireOrSmokeAlert(alerts);

  if (fireAlert) {
    return {
      trigger: `If nearby wildfire or smoke pressure, including "${fireAlert.title}", makes the full itinerary feel less responsible`,
      alternative: buildFireFallbackAlternative(destination),
      whyItWorks:
        "You keep a lower-commitment version of the trip alive while avoiding the most exposure-sensitive segment.",
      timeDifference: "Usually saves 60-120 minutes of remote mileage and leaves more room to bail early if conditions drift.",
    };
  }

  if (routeAlert) {
    const delayMinutes = parseEstimatedDelayMinutes(routeAlert);
    return {
      trigger: `Current route access alerts, including "${routeAlert.title}", still make the full access loop feel fragile`,
      alternative: buildRouteFallbackAlternative(destination),
      whyItWorks:
        "You keep the highest-confidence scenery and town support while cutting the most fragile route segment out of the day.",
      timeDifference:
        delayMinutes != null
          ? `Usually cuts roughly ${delayMinutes}-${delayMinutes + 45} minutes of reroute churn.`
          : "Usually saves 45-90 minutes of route churn versus forcing the full loop.",
    };
  }

  if ((weather?.heatRisk ?? 0) >= 65) {
    return {
      trigger: "If afternoon heat keeps the full itinerary from feeling worthwhile",
      alternative: buildWeatherFallbackAlternative(destination, "heat"),
      whyItWorks:
        "You keep the best light and scenery windows while moving the most exposed block out of the middle of the day.",
      timeDifference: "Usually trades 2-4 hours of exposed midday time for a safer reset block.",
    };
  }

  if ((weather?.snowRisk ?? 0) >= 55) {
    return {
      trigger: "If higher-elevation access still feels too wintry to commit to",
      alternative: buildWeatherFallbackAlternative(destination, "snow"),
      whyItWorks:
        "The trip still lands because the lower-elevation version preserves scenery without chain-control roulette.",
      timeDifference: "Usually trims 30-90 minutes of uncertain road time.",
    };
  }

  if ((weather?.windSpeed ?? 0) >= 25 || (weather?.precipitationProbability ?? 0) >= 60) {
    return {
      trigger: "If wind or rain makes the exposed route feel less worth it",
      alternative: buildWeatherFallbackAlternative(destination, "wind"),
      whyItWorks:
        "You preserve the trip mood while cutting the most weather-sensitive stretch out of the day.",
      timeDifference: "Usually saves 30-60 minutes of exposed driving and standing around.",
    };
  }

  return seededPlan;
}

function computePlanBScore(destination: Destination, weather: WeatherSummary | null, alerts: AlertRow[]) {
  let score = destination.breakdown.planB;
  const routeAlert = getRouteAccessAlert(alerts);
  const fireAlert = getFireOrSmokeAlert(alerts);

  if (!routeAlert && alerts.length === 0 && (weather?.heatRisk ?? 0) < 65 && (weather?.snowRisk ?? 0) < 55 && (weather?.windSpeed ?? 0) < 25 && (weather?.precipitationProbability ?? 0) < 60) {
    return clamp(score + 5, 32, 96);
  }

  if (fireAlert) {
    score -= Math.round(severityPenalty(fireAlert.severity) * 0.45);
    score += 3;
  }

  if (routeAlert) {
    score -= Math.round(severityPenalty(routeAlert.severity) * 0.4);
    score += 4;
  }

  if ((weather?.heatRisk ?? 0) >= 80 || (weather?.snowRisk ?? 0) >= 70) {
    score -= 8;
  } else if ((weather?.heatRisk ?? 0) >= 65 || (weather?.snowRisk ?? 0) >= 55) {
    score -= 4;
  }

  if ((weather?.windSpeed ?? 0) >= 30 || (weather?.precipitationProbability ?? 0) >= 70) {
    score -= 4;
  }

  if (alerts.length >= 2) {
    score -= Math.min(6, alerts.length * 2);
  }

  return clamp(score, 24, 92);
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
    if (
      /\bclosed|closure|road closed|lane|one-way traffic|slide|washout|chain control|fire|flood|evac|heat advisory|winter storm\b/.test(
        title,
      )
    ) {
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

    if (/\bclosed|closure|road closed|lane|one-way traffic|slide|washout|chain control\b/.test(title)) {
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
    return "No active weather, park, forest, wildfire, or route alerts are currently being tracked for this destination.";
  }

  const primaryAlert = getPrimaryAlert(alerts);
  return `${alerts.length} active alert${alerts.length > 1 ? "s are" : " is"} being tracked, led by "${primaryAlert?.title ?? primaryAlert?.alert_type ?? "current alert"}".`;
}

function toDecisionWeather(weather: WeatherSummary | null) {
  if (!weather) {
    return null;
  }

  return {
    snapshotDate: new Date().toISOString().slice(0, 10),
    highTemp: weather.highTemp,
    lowTemp: weather.lowTemp,
    precipitationProbability: weather.precipitationProbability,
    windSpeed: weather.windSpeed,
    snowRisk: weather.snowRisk,
    heatRisk: weather.heatRisk,
  };
}

function toDecisionAlerts(alerts: AlertRow[]) {
  return alerts.map((alert) => ({
    source: alert.source,
    alertType: alert.alert_type,
    severity: alert.severity,
    title: alert.title,
    description: alert.description,
    effectiveDate: alert.effective_date,
    expirationDate: alert.expiration_date,
  }));
}

function buildMainWarning(
  destination: Destination,
  weather: WeatherSummary | null,
  alerts: AlertRow[],
) {
  const decision = getDecisionStatus(toDecisionAlerts(alerts), toDecisionWeather(weather));

  if (decision.level === "block" || decision.level === "warn") {
    return decision.signals[0]?.detail ?? destination.mainWarning;
  }

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
  const decision = getDecisionStatus(toDecisionAlerts(alerts), toDecisionWeather(weather));
  const lead =
    decision.level === "block"
      ? "Hard access constraints are active."
      : decision.level === "warn"
        ? "Active warnings are shaping the trip."
        : fitLabel === "Excellent now"
          ? "Strong current pick."
          : fitLabel === "Good with caution"
            ? "Still workable, but some caution is justified."
            : fitLabel === "Mixed conditions"
              ? "Conditions are mixed enough that tradeoffs are obvious."
              : "This is currently a weak fit unless your constraints are very specific.";

  if (alerts.length > 0) {
    const primaryAlert = getPrimaryAlert(alerts);
    return `${lead} ${decision.headline} The main trip-shaping issue right now is ${primaryAlert?.title ?? "an active alert"}.`;
  }

  if (weather) {
    return `${lead} ${decision.headline} Weather is currently pointing to highs near ${weather.highTemp}F and lows near ${weather.lowTemp}F.`;
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
  const nowEpoch = Date.now();
  const districtIds = unique(
    destinations.flatMap((destination) => {
      const watch =
        destinationSeedMeta[destination.slug as keyof typeof destinationSeedMeta]?.caltransWatch;

      return watch?.districts ?? [];
    }),
  ).sort((left, right) => left - right);
  const caltransClosuresByDistrict = new Map<number, CaltransClosure[]>();
  const usfsAlertsByUrl = new Map<
    string,
    ReturnType<typeof parseUsfsAlertsPage>
  >();
  const usfsConditionsByUrl = new Map<
    string,
    ReturnType<typeof parseUsfsConditionsPage>
  >();
  let californiaWildfires: WfigsIncident[] = [];

  const destinationIds = destinations.map((destination) => destination.id);
  if (destinationIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("alerts")
      .delete()
      .in("destination_id", destinationIds)
      .in("source", ["nws", "nps", "caltrans", "wfigs", "usfs"]);

    if (deleteError) {
      throw deleteError;
    }
  }

  for (const district of districtIds) {
    try {
      const districtCode = String(district).padStart(2, "0");
      const response = await fetchCaltransJson<CaltransLaneClosureResponse>(
        `https://cwwp2.dot.ca.gov/data/d${district}/lcs/lcsStatusD${districtCode}.json`,
      );
      const activeClosures = (response.data ?? [])
        .map((entry) => entry.lcs)
        .filter((closure): closure is CaltransClosure => closure != null)
        .filter((closure) => isActiveCaltransClosure(closure, nowEpoch));

      caltransClosuresByDistrict.set(district, activeClosures);
    } catch (error) {
      console.warn(`Skipping CalTrans lane-closure sync for district ${district}:`, error);
    }
  }

  try {
    californiaWildfires = await fetchCaliforniaWildfires();
  } catch (error) {
    console.warn("Skipping WFIGS wildfire sync:", error);
  }

  const usfsAlertUrls = unique(
    destinations.flatMap((destination) => {
      const watch =
        destinationSeedMeta[destination.slug as keyof typeof destinationSeedMeta]?.usfsWatch;

      return watch?.alertsUrl ? [watch.alertsUrl] : [];
    }),
  );
  const usfsConditionsUrls = unique(
    destinations.flatMap((destination) => {
      const watch =
        destinationSeedMeta[destination.slug as keyof typeof destinationSeedMeta]
          ?.usfsConditionsWatch;

      return watch?.conditionsUrl ? [watch.conditionsUrl] : [];
    }),
  );

  for (const alertsUrl of usfsAlertUrls) {
    try {
      const html = await fetchHtml(alertsUrl);
      usfsAlertsByUrl.set(alertsUrl, parseUsfsAlertsPage(html, alertsUrl));
    } catch (error) {
      console.warn(`Skipping USFS alerts sync for ${alertsUrl}:`, error);
    }
  }

  for (const conditionsUrl of usfsConditionsUrls) {
    try {
      const html = await fetchHtml(conditionsUrl);
      usfsConditionsByUrl.set(conditionsUrl, parseUsfsConditionsPage(html));
    } catch (error) {
      console.warn(`Skipping USFS conditions sync for ${conditionsUrl}:`, error);
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

    const caltransWatch =
      destinationSeedMeta[destination.slug as keyof typeof destinationSeedMeta]?.caltransWatch;
    const usfsWatch =
      destinationSeedMeta[destination.slug as keyof typeof destinationSeedMeta]?.usfsWatch;
    const usfsConditionsWatch =
      destinationSeedMeta[destination.slug as keyof typeof destinationSeedMeta]
        ?.usfsConditionsWatch;

    if (caltransWatch) {
      const matchingClosures = caltransWatch.districts.flatMap((district) => {
        return (caltransClosuresByDistrict.get(district) ?? []).filter((closure) =>
          matchesCaltransWatch(destination, caltransWatch, closure),
        );
      });

      matchingClosures
        .sort((left, right) => {
          const severityDelta =
            severityPenalty(inferCaltransSeverity(right)) - severityPenalty(inferCaltransSeverity(left));

          if (severityDelta !== 0) {
            return severityDelta;
          }

          const leftDistance = getClosureDistanceMiles(destination, left) ?? Number.POSITIVE_INFINITY;
          const rightDistance = getClosureDistanceMiles(destination, right) ?? Number.POSITIVE_INFINITY;
          return leftDistance - rightDistance;
        })
        .slice(0, 4)
        .forEach((closure) => {
          const startEpoch = parseEpoch(closure.closure?.closureTimestamp?.closureStartEpoch);
          const endEpoch = parseEpoch(closure.closure?.closureTimestamp?.closureEndEpoch);

          rowsToInsert.push({
            destination_id: destination.id,
            source: "caltrans",
            source_id: closure.index ?? null,
            alert_type: "Road access",
            severity: inferCaltransSeverity(closure),
            title: formatCaltransTitle(closure),
            description: formatCaltransDescription(closure),
            effective_date: epochToIso(startEpoch),
            expiration_date: epochToIso(endEpoch),
          });
        });
    }

    if (usfsWatch) {
      const relevantUsfsAlerts = selectRelevantUsfsAlerts(
        usfsAlertsByUrl.get(usfsWatch.alertsUrl) ?? [],
        usfsWatch,
      ).slice(0, usfsWatch.maxAlerts ?? 4);

      rowsToInsert.push(
        ...relevantUsfsAlerts.map((alert) => ({
          destination_id: destination.id,
          source: "usfs",
          source_id: alert.href,
          alert_type: "Forest alert",
          severity: mapUsfsSeverity(alert.levelClass),
          title: alert.title,
          description: [alert.description, alert.forestOrder ? `Forest Order: ${alert.forestOrder}.` : null]
            .filter(Boolean)
            .join(" "),
          effective_date: alert.effectiveDate,
          expiration_date: alert.expirationDate,
        })),
      );
    }

    if (usfsConditionsWatch) {
      const parsedConditions = usfsConditionsByUrl.get(usfsConditionsWatch.conditionsUrl);

      if (parsedConditions) {
        const relevantConditionLines = selectRelevantUsfsConditionLines(
          parsedConditions,
          usfsConditionsWatch,
        );

        rowsToInsert.push(
          ...relevantConditionLines.map((line, index) => ({
            destination_id: destination.id,
            source: "usfs",
            source_id: `${usfsConditionsWatch.conditionsUrl}#${index}-${line.slice(0, 48)}`,
            alert_type: "Forest condition",
            severity: mapUsfsConditionSeverity(line),
            title: line,
            description: parsedConditions.lastUpdated
              ? `Current conditions update from ${usfsConditionsWatch.forestName}. Last updated ${new Date(parsedConditions.lastUpdated).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`
              : `Current conditions update from ${usfsConditionsWatch.forestName}.`,
            effective_date: parsedConditions.lastUpdated,
            expiration_date: null,
          })),
        );
      }
    }

    if (destination.latitude != null && destination.longitude != null && californiaWildfires.length > 0) {
      californiaWildfires
        .map((incident) => ({
          incident,
          distanceMiles: haversineMiles(
            destination.latitude!,
            destination.longitude!,
            incident.latitude,
            incident.longitude,
          ),
        }))
        .filter(({ distanceMiles }) => distanceMiles <= wildfireRadiusMilesForDestination(destination))
        .filter(({ incident, distanceMiles }) => shouldTrackWildfireIncident(incident, distanceMiles))
        .sort((left, right) => {
          const severityDelta =
            severityPenalty(
              inferWildfireSeverity(
                right.distanceMiles,
                right.incident.sizeAcres,
                right.incident.percentContained,
              ),
            ) -
            severityPenalty(
              inferWildfireSeverity(
                left.distanceMiles,
                left.incident.sizeAcres,
                left.incident.percentContained,
              ),
            );

          if (severityDelta !== 0) {
            return severityDelta;
          }

          return left.distanceMiles - right.distanceMiles;
        })
        .slice(0, 3)
        .forEach(({ incident, distanceMiles }) => {
          rowsToInsert.push({
            destination_id: destination.id,
            source: "wfigs",
            source_id: incident.sourceId,
            alert_type: "Wildfire incident",
            severity: inferWildfireSeverity(
              distanceMiles,
              incident.sizeAcres,
              incident.percentContained,
            ),
            title: buildWildfireTitle(incident, distanceMiles),
            description: buildWildfireDescription(destination, incident, distanceMiles),
            effective_date: incident.discoveryDate,
            expiration_date: null,
          });
        });
    }
  }

  const dedupedRows = unique(
    rowsToInsert.map((row) => JSON.stringify([row.destination_id, row.source, row.alert_type, row.title])),
  ).map((serialized) => {
    const [destination_id, source, alert_type, title] = JSON.parse(serialized) as [
      string,
      string,
      string,
      string,
    ];

    return rowsToInsert.find(
      (row) =>
        row.destination_id === destination_id &&
        row.source === source &&
        row.alert_type === alert_type &&
        row.title === title,
    )!;
  });

  if (dedupedRows.length > 0) {
    const { error: insertError } = await supabase.from("alerts").insert(dedupedRows);

    if (insertError) {
      throw insertError;
    }
  }

  return {
    synced: dedupedRows.length,
    nwsCount: dedupedRows.filter((row) => row.source === "nws").length,
    npsCount: dedupedRows.filter((row) => row.source === "nps").length,
    caltransCount: dedupedRows.filter((row) => row.source === "caltrans").length,
    usfsCount: dedupedRows.filter((row) => row.source === "usfs").length,
    wildfireCount: dedupedRows.filter((row) => row.source === "wfigs").length,
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
      const dynamicPlanB = buildDynamicPlanB(seeded, weather, alerts);

      const breakdown: ScoreBreakdown = {
        ...seeded.breakdown,
        seasonality: seasonalRule?.score ?? seeded.breakdown.seasonality,
        weather: computeWeatherScore(seeded, weather),
        alerts: computeAlertScore(alerts, seeded),
        planB: computePlanBScore(seeded, weather, alerts),
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
        plan_b: dynamicPlanB,
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
