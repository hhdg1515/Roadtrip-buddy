import type {
  DrivingTolerance,
  GroupProfile,
  InterestKey,
  InterestMode,
  LodgingStyle,
  Origin,
  TripFormat,
  TripIntensity,
  TripLength,
} from "@/lib/data/openseason";

export function parseOrigin(value: string | null | undefined): Origin | null {
  if (
    value === "bay-area" ||
    value === "los-angeles" ||
    value === "san-diego" ||
    value === "sacramento"
  ) {
    return value;
  }

  return null;
}

export function parseTripLength(value: string | null | undefined): TripLength | null {
  if (value === "weekend" || value === "3-days" || value === "5-days" || value === "7-days") {
    return value;
  }

  return null;
}

export function parseStartDate(value: string | null | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : value;
}

export function parseDrivingTolerance(
  value: string | null | undefined,
): DrivingTolerance | null {
  if (value === "tight" || value === "balanced" || value === "stretch") {
    return value;
  }

  return null;
}

export function parseGroupProfile(value: string | null | undefined): GroupProfile | null {
  if (value === "mixed" || value === "active" || value === "easygoing" || value === "food-first") {
    return value;
  }

  return null;
}

export function parseTripFormat(value: string | null | undefined): TripFormat | null {
  if (value === "same-day" || value === "one-night" || value === "weekend-stay") {
    return value;
  }

  return null;
}

export function parseTripIntensity(value: string | null | undefined): TripIntensity | null {
  if (value === "slow" || value === "balanced" || value === "full-days") {
    return value;
  }

  return null;
}

export function parseLodgingStyle(value: string | null | undefined): LodgingStyle | null {
  if (value === "town-base" || value === "cabin-lodge" || value === "camping") {
    return value;
  }

  return null;
}

export function parseInterestMode(value: string | null | undefined): InterestMode | null {
  if (value === "open" || value === "specific") {
    return value;
  }

  return null;
}

export function parseInterests(value: string | string[] | null | undefined) {
  const values = (Array.isArray(value) ? value : value ? [value] : []).filter(Boolean);
  return values.filter(isInterestKey);
}

export function isInterestKey(value: string): value is InterestKey {
  return (
    value === "scenic-views" ||
    value === "moderate-hiking" ||
    value === "easy-walks" ||
    value === "good-food" ||
    value === "photography" ||
    value === "snow-play"
  );
}
