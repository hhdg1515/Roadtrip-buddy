import type { UserPreferences } from "@/lib/account";
import {
  type InterestMode,
  type LodgingStyle,
  planningPreset,
  type DrivingTolerance,
  type GroupProfile,
  type InterestKey,
  type Origin,
  type RankingContext,
  type TripFormat,
  type TripIntensity,
  type TripLength,
} from "@/lib/data/openseason";
import {
  parseDrivingTolerance,
  parseGroupProfile,
  parseInterestMode,
  parseInterests,
  parseLodgingStyle,
  parseOrigin,
  parseStartDate,
  parseTripFormat,
  parseTripIntensity,
  parseTripLength,
} from "@/lib/planning-params";

export type PlanningState = {
  origin: Origin;
  tripLength: TripLength;
  startDate: string | null;
  drivingTolerance: DrivingTolerance;
  groupProfile: GroupProfile;
  tripFormat: TripFormat;
  tripIntensity: TripIntensity;
  lodgingStyle: LodgingStyle;
  interestMode: InterestMode;
  interests: InterestKey[];
  usedProfileDefaults: boolean;
};

export function getPlanningState(
  searchParams: Record<string, string | string[] | undefined>,
  preferences?: UserPreferences,
): PlanningState {
  const defaultState: Omit<PlanningState, "usedProfileDefaults"> =
    getDefaultPlanningState(preferences);

  const origin = parseOrigin(getFirstValue(searchParams.origin)) ?? defaultState.origin;
  const tripLength =
    parseTripLength(getFirstValue(searchParams.tripLength)) ?? defaultState.tripLength;
  const startDate = parseStartDate(getFirstValue(searchParams.startDate));
  const drivingTolerance =
    parseDrivingTolerance(getFirstValue(searchParams.drivingTolerance)) ??
    defaultState.drivingTolerance;
  const groupProfile =
    parseGroupProfile(getFirstValue(searchParams.groupProfile)) ?? defaultState.groupProfile;
  const tripFormat =
    parseTripFormat(getFirstValue(searchParams.tripFormat)) ?? defaultState.tripFormat;
  const tripIntensity =
    parseTripIntensity(getFirstValue(searchParams.tripIntensity)) ?? defaultState.tripIntensity;
  const lodgingStyle =
    parseLodgingStyle(getFirstValue(searchParams.lodgingStyle)) ?? defaultState.lodgingStyle;
  const interestMode =
    parseInterestMode(getFirstValue(searchParams.interestMode)) ?? defaultState.interestMode;
  const interests = parseInterests(searchParams.interests);
  const hasExplicitInterestInput =
    Boolean(getFirstValue(searchParams.interestMode)) || searchParams.interests !== undefined;

  return {
    origin,
    tripLength,
    startDate,
    drivingTolerance,
    groupProfile,
    tripFormat,
    tripIntensity,
    lodgingStyle,
    interestMode,
    interests:
      interestMode === "open"
        ? []
        : hasExplicitInterestInput
          ? interests
          : defaultState.interests,
    usedProfileDefaults:
      !getFirstValue(searchParams.origin) &&
      !getFirstValue(searchParams.tripLength) &&
      !getFirstValue(searchParams.startDate) &&
      !getFirstValue(searchParams.drivingTolerance) &&
      !getFirstValue(searchParams.groupProfile) &&
      !getFirstValue(searchParams.tripFormat) &&
      !getFirstValue(searchParams.tripIntensity) &&
      !getFirstValue(searchParams.lodgingStyle) &&
      !getFirstValue(searchParams.interestMode) &&
      !searchParams.interests,
  };
}

export function rankingContextFromPlanning(
  state: Omit<PlanningState, "usedProfileDefaults">,
): RankingContext {
  return {
    drivingTolerance: state.drivingTolerance,
    groupProfile: state.groupProfile,
    tripFormat: state.tripFormat,
    tripIntensity: state.tripIntensity,
    lodgingStyle: state.lodgingStyle,
    interests: state.interestMode === "open" ? [] : state.interests,
    startDate: state.startDate,
  };
}

export function toPlanningQueryString(state: Omit<PlanningState, "usedProfileDefaults">) {
  const params = new URLSearchParams();
  params.set("origin", state.origin);
  params.set("tripLength", state.tripLength);
  if (state.startDate) {
    params.set("startDate", state.startDate);
  }
  params.set("drivingTolerance", state.drivingTolerance);
  params.set("groupProfile", state.groupProfile);
  params.set("tripFormat", state.tripFormat);
  params.set("tripIntensity", state.tripIntensity);
  params.set("lodgingStyle", state.lodgingStyle);
  params.set("interestMode", state.interestMode);

  if (state.interestMode === "specific") {
    for (const interest of state.interests) {
      params.append("interests", interest);
    }
  }

  return params.toString();
}

export function toComparisonQueryString(
  state: Omit<PlanningState, "usedProfileDefaults">,
  slugs: string[],
) {
  const params = new URLSearchParams(toPlanningQueryString(state));

  for (const slug of slugs) {
    params.append("slugs", slug);
  }

  return params.toString();
}

export function describePlanningState(state: PlanningState) {
  const start = state.startDate ? ` starting ${labelPlanningDate(state.startDate)}` : "";
  const interests =
    state.interestMode === "open"
      ? "with no strong activity preference"
      : `and a focus on ${state.interests.map(labelInterest).join(", ")}`;

  return `I want a ${labelTripLength(state.tripLength).toLowerCase()} trip from ${labelOrigin(
    state.origin,
  )}${start}, using a ${labelTripFormat(state.tripFormat).toLowerCase()}, with ${labelTripIntensity(state.tripIntensity).toLowerCase()}, ${labelLodgingStyle(
    state.lodgingStyle,
  ).toLowerCase()}, ${interests} for a ${labelGroupProfile(
    state.groupProfile,
  ).toLowerCase()} group.`;
}

export function labelOrigin(origin: Origin) {
  switch (origin) {
    case "bay-area":
      return "Bay Area";
    case "los-angeles":
      return "Los Angeles";
    case "san-diego":
      return "San Diego";
    case "sacramento":
      return "Sacramento";
    default:
      return origin;
  }
}

export function labelTripLength(tripLength: TripLength) {
  switch (tripLength) {
    case "weekend":
      return "Weekend";
    case "3-days":
      return "3 days";
    case "5-days":
      return "5 days";
    case "7-days":
      return "7 days";
    default:
      return tripLength;
  }
}

export function labelDrivingTolerance(drivingTolerance: DrivingTolerance) {
  switch (drivingTolerance) {
    case "tight":
      return "Keep drives tight";
    case "balanced":
      return "Balanced road trip";
    case "stretch":
      return "Okay with long drives";
    default:
      return drivingTolerance;
  }
}

export function labelGroupProfile(groupProfile: GroupProfile) {
  switch (groupProfile) {
    case "mixed":
      return "Mixed energy group";
    case "active":
      return "Activity-first group";
    case "easygoing":
      return "Easygoing scenic trip";
    case "food-first":
      return "Food and town first";
    default:
      return groupProfile;
  }
}

export function labelTripFormat(tripFormat: TripFormat) {
  switch (tripFormat) {
    case "same-day":
      return "Same-day return";
    case "one-night":
      return "One-night escape";
    case "weekend-stay":
      return "Stay the whole weekend";
    default:
      return tripFormat;
  }
}

export function labelTripIntensity(tripIntensity: TripIntensity) {
  switch (tripIntensity) {
    case "slow":
      return "Keep days light";
    case "balanced":
      return "Balanced days";
    case "full-days":
      return "Pack full days";
    default:
      return tripIntensity;
  }
}

export function labelLodgingStyle(lodgingStyle: LodgingStyle) {
  switch (lodgingStyle) {
    case "town-base":
      return "Town base with food";
    case "cabin-lodge":
      return "Cabin or lodge feel";
    case "camping":
      return "Camping-forward";
    default:
      return lodgingStyle;
  }
}

export function labelPlanningDate(startDate: string) {
  const parsed = new Date(`${startDate}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return startDate;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export function labelInterest(interest: InterestKey) {
  switch (interest) {
    case "scenic-views":
      return "Scenic views";
    case "moderate-hiking":
      return "Moderate hiking";
    case "easy-walks":
      return "Easy walks";
    case "good-food":
      return "Good food / cafe";
    case "photography":
      return "Photography";
    case "snow-play":
      return "Snow interest";
    default:
      return interest;
  }
}

function getDefaultPlanningState(
  preferences?: UserPreferences,
): Omit<PlanningState, "usedProfileDefaults"> {
  const inferredOrigin = inferOrigin(preferences?.originCity);
  const inferredDrivingTolerance = inferDrivingTolerance(preferences?.drivingTolerance);
  const inferredGroupProfile = inferGroupProfile(preferences?.groupDefault);
  const inferredTripIntensity = inferTripIntensity(preferences?.groupDefault);
  const inferredLodgingStyle = inferLodgingStyle(preferences?.lodgingPreference);
  const inferredInterests = inferInterests(preferences?.favoriteActivities ?? []);

  return {
    origin: inferredOrigin ?? planningPreset.origin,
    tripLength: planningPreset.tripLength,
    startDate: null,
    drivingTolerance: inferredDrivingTolerance ?? planningPreset.drivingToleranceId,
    groupProfile: inferredGroupProfile ?? planningPreset.groupProfile,
    tripFormat: planningPreset.tripFormat,
    tripIntensity: inferredTripIntensity ?? planningPreset.tripIntensity,
    lodgingStyle: inferredLodgingStyle ?? planningPreset.lodgingStyle,
    interestMode: inferredInterests.length > 0 ? "specific" : "open",
    interests:
      inferredInterests.length > 0 ? inferredInterests : [...planningPreset.interestKeys],
  };
}

function inferOrigin(originCity: string | undefined) {
  const normalized = normalizeText(originCity ?? "");

  if (normalized.includes("bay")) {
    return "bay-area" satisfies Origin;
  }
  if (normalized.includes("los angeles") || normalized.includes("la")) {
    return "los-angeles" satisfies Origin;
  }
  if (normalized.includes("san diego")) {
    return "san-diego" satisfies Origin;
  }
  if (normalized.includes("sacramento")) {
    return "sacramento" satisfies Origin;
  }

  return null;
}

function inferDrivingTolerance(value: string | undefined) {
  const normalized = normalizeText(value ?? "");

  if (normalized.includes("4") || normalized.includes("tight")) {
    return "tight" satisfies DrivingTolerance;
  }
  if (
    normalized.includes("7") ||
    normalized.includes("8") ||
    normalized.includes("long") ||
    normalized.includes("stretch")
  ) {
    return "stretch" satisfies DrivingTolerance;
  }
  if (normalized.length > 0) {
    return "balanced" satisfies DrivingTolerance;
  }

  return null;
}

function inferGroupProfile(value: string | undefined) {
  const normalized = normalizeText(value ?? "");

  if (normalized.includes("mixed") || normalized.includes("non hiker")) {
    return "mixed" satisfies GroupProfile;
  }
  if (normalized.includes("active") || normalized.includes("hiker")) {
    return "active" satisfies GroupProfile;
  }
  if (normalized.includes("food") || normalized.includes("cafe") || normalized.includes("town")) {
    return "food-first" satisfies GroupProfile;
  }
  if (normalized.includes("easy") || normalized.includes("scenic") || normalized.includes("low")) {
    return "easygoing" satisfies GroupProfile;
  }

  return null;
}

function inferTripIntensity(value: string | undefined) {
  const normalized = normalizeText(value ?? "");

  if (normalized.includes("easy") || normalized.includes("low") || normalized.includes("slow")) {
    return "slow" satisfies TripIntensity;
  }
  if (normalized.includes("active") || normalized.includes("hiker")) {
    return "full-days" satisfies TripIntensity;
  }
  if (normalized.length > 0) {
    return "balanced" satisfies TripIntensity;
  }

  return null;
}

function inferLodgingStyle(value: string | undefined) {
  const normalized = normalizeText(value ?? "");

  if (normalized.includes("camp")) {
    return "camping" satisfies LodgingStyle;
  }
  if (
    normalized.includes("cabin") ||
    normalized.includes("lodge") ||
    normalized.includes("resort")
  ) {
    return "cabin-lodge" satisfies LodgingStyle;
  }
  if (
    normalized.includes("town") ||
    normalized.includes("food") ||
    normalized.includes("cafe")
  ) {
    return "town-base" satisfies LodgingStyle;
  }

  return null;
}

function inferInterests(values: string[]) {
  const inferred = new Set<InterestKey>();

  for (const value of values) {
    const normalized = normalizeText(value);

    if (normalized.includes("scenic") || normalized.includes("view")) {
      inferred.add("scenic-views");
    }
    if (normalized.includes("moderate") || normalized.includes("hiking") || normalized.includes("hike")) {
      inferred.add("moderate-hiking");
    }
    if (normalized.includes("easy") || normalized.includes("walk")) {
      inferred.add("easy-walks");
    }
    if (normalized.includes("food") || normalized.includes("cafe") || normalized.includes("dinner")) {
      inferred.add("good-food");
    }
    if (normalized.includes("photo")) {
      inferred.add("photography");
    }
    if (normalized.includes("snow") || normalized.includes("ski")) {
      inferred.add("snow-play");
    }
  }

  return [...inferred];
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
