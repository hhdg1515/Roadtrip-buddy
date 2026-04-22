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

export const MAX_COMPARE_DESTINATIONS = 4;

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

export function withPlanningQuery(path: string, state: Omit<PlanningState, "usedProfileDefaults">) {
  return withQueryString(path, toPlanningQueryString(state));
}

export function pickPlanningQueryString(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();

  for (const key of [
    "origin",
    "tripLength",
    "startDate",
    "drivingTolerance",
    "groupProfile",
    "tripFormat",
    "tripIntensity",
    "lodgingStyle",
    "interestMode",
    "interests",
  ] as const) {
    const value = searchParams[key];

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item) {
          params.append(key, item);
        }
      }
      continue;
    }

    if (value) {
      params.set(key, value);
    }
  }

  return params.toString();
}

export function toComparisonQueryString(
  state: Omit<PlanningState, "usedProfileDefaults">,
  slugs: string[],
) {
  const params = new URLSearchParams(toPlanningQueryString(state));

  for (const slug of normalizeCompareSlugs(slugs)) {
    params.append("slugs", slug);
  }

  return params.toString();
}

export function getCompareSlugs(searchParams: Record<string, string | string[] | undefined>) {
  return normalizeCompareSlugs(searchParams.slugs);
}

export function normalizeCompareSlugs(value: string | string[] | undefined) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  const unique: string[] = [];

  for (const item of values) {
    if (!item || unique.includes(item)) {
      continue;
    }
    unique.push(item);
    if (unique.length >= MAX_COMPARE_DESTINATIONS) {
      break;
    }
  }

  return unique;
}

export function withCompareSlugs(path: string, slugs: string[]) {
  const selectedSlugs = normalizeCompareSlugs(slugs);

  if (selectedSlugs.length === 0) {
    return path;
  }

  const [basePath, currentQuery = ""] = path.split("?");
  const params = new URLSearchParams(currentQuery);
  params.delete("slugs");

  for (const slug of selectedSlugs) {
    params.append("slugs", slug);
  }

  const nextQuery = params.toString();
  return nextQuery ? `${basePath}?${nextQuery}` : basePath;
}

export function toSavedTripQueryString(input: {
  userOrigin: string | null | undefined;
  preferences: Record<string, unknown> | null | undefined;
}) {
  const params = new URLSearchParams();
  const origin = parseOrigin(input.userOrigin);
  const preferenceRecord = input.preferences ?? {};

  const tripLength = parseTripLength(readString(preferenceRecord.tripLength));
  const startDate = parseStartDate(readString(preferenceRecord.startDate));
  const drivingTolerance = parseDrivingTolerance(readString(preferenceRecord.drivingTolerance));
  const groupProfile = parseGroupProfile(readString(preferenceRecord.groupProfile));
  const tripFormat = parseTripFormat(readString(preferenceRecord.tripFormat));
  const tripIntensity = parseTripIntensity(readString(preferenceRecord.tripIntensity));
  const lodgingStyle = parseLodgingStyle(readString(preferenceRecord.lodgingStyle));
  const interestMode = parseInterestMode(readString(preferenceRecord.interestMode));
  const interests = parseInterests(readStringArray(preferenceRecord.interests));

  if (origin) {
    params.set("origin", origin);
  }
  if (tripLength) {
    params.set("tripLength", tripLength);
  }
  if (startDate) {
    params.set("startDate", startDate);
  }
  if (drivingTolerance) {
    params.set("drivingTolerance", drivingTolerance);
  }
  if (groupProfile) {
    params.set("groupProfile", groupProfile);
  }
  if (tripFormat) {
    params.set("tripFormat", tripFormat);
  }
  if (tripIntensity) {
    params.set("tripIntensity", tripIntensity);
  }
  if (lodgingStyle) {
    params.set("lodgingStyle", lodgingStyle);
  }
  if (interestMode) {
    params.set("interestMode", interestMode);
  }
  if (interestMode === "specific") {
    for (const interest of interests) {
      params.append("interests", interest);
    }
  }

  return params.toString();
}

export function withQueryString(path: string, queryString: string | null | undefined) {
  return queryString ? `${path}?${queryString}` : path;
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
  const groupProfile = preferences?.groupProfile ?? planningPreset.groupProfile;
  const interests = preferences?.interests ?? [...planningPreset.interestKeys];

  return {
    origin: preferences?.origin ?? planningPreset.origin,
    tripLength: planningPreset.tripLength,
    startDate: null,
    drivingTolerance: preferences?.drivingTolerance ?? planningPreset.drivingToleranceId,
    groupProfile,
    tripFormat: planningPreset.tripFormat,
    tripIntensity: deriveTripIntensity(groupProfile),
    lodgingStyle: preferences?.lodgingStyle ?? planningPreset.lodgingStyle,
    interestMode: interests.length > 0 ? "specific" : "open",
    interests: interests.length > 0 ? interests : [...planningPreset.interestKeys],
  };
}

function deriveTripIntensity(groupProfile: GroupProfile): TripIntensity {
  switch (groupProfile) {
    case "active":
      return "full-days";
    case "easygoing":
      return "slow";
    default:
      return "balanced";
  }
}

function readString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
