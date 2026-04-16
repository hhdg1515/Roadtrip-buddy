export type ScoreBreakdown = {
  seasonality: number;
  weather: number;
  activityMatch: number;
  driveTime: number;
  alerts: number;
  groupFit: number;
  lodging: number;
  planB: number;
};

export type ScoringContext = {
  driveHours: number;
  driveLimitHours: number;
  isInBestMonth: boolean;
  isInAvoidMonth: boolean;
  interestMatches: number;
  totalInterests: number;
  groupMatchBoost: number;
  tripLengthMatch: boolean;
  lodgingMatchBoost: number;
};

const scoreWeights: Record<keyof ScoreBreakdown, number> = {
  seasonality: 0.22,
  weather: 0.16,
  activityMatch: 0.18,
  driveTime: 0.12,
  alerts: 0.12,
  groupFit: 0.08,
  lodging: 0.06,
  planB: 0.06,
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

export function computeDriveTimeScore(driveHours: number, driveLimitHours: number) {
  if (driveLimitHours <= 0) return 50;
  const ratio = driveHours / driveLimitHours;
  if (ratio <= 1) {
    return clamp(Math.round(100 - ratio * 15));
  }
  const overshoot = ratio - 1;
  return clamp(Math.round(85 - overshoot * 55));
}

export function computeSeasonalityScore(
  baseline: number,
  isInBestMonth: boolean,
  isInAvoidMonth: boolean,
) {
  if (isInAvoidMonth) return clamp(baseline - 45);
  if (isInBestMonth) return clamp(baseline + 8);
  return clamp(baseline - 10);
}

export function computeActivityMatchScore(
  baseline: number,
  interestMatches: number,
  totalInterests: number,
) {
  if (totalInterests === 0) return baseline;
  const matchRatio = interestMatches / totalInterests;
  const delta = Math.round((matchRatio - 0.5) * 40);
  return clamp(baseline + delta);
}

export function computeGroupFitScore(baseline: number, groupMatchBoost: number) {
  return clamp(baseline + groupMatchBoost);
}

export function computeLodgingScore(baseline: number, lodgingMatchBoost: number) {
  return clamp(baseline + lodgingMatchBoost);
}

export function computePlanBScore(baseline: number, tripLengthMatch: boolean) {
  return clamp(baseline + (tripLengthMatch ? 3 : -6));
}

export function resolveBreakdown(
  breakdown: ScoreBreakdown,
  context?: ScoringContext,
): ScoreBreakdown {
  if (!context) {
    return {
      seasonality: clamp(breakdown.seasonality),
      weather: clamp(breakdown.weather),
      activityMatch: clamp(breakdown.activityMatch),
      driveTime: clamp(breakdown.driveTime),
      alerts: clamp(breakdown.alerts),
      groupFit: clamp(breakdown.groupFit),
      lodging: clamp(breakdown.lodging),
      planB: clamp(breakdown.planB),
    };
  }

  return {
    seasonality: computeSeasonalityScore(
      breakdown.seasonality,
      context.isInBestMonth,
      context.isInAvoidMonth,
    ),
    weather: clamp(breakdown.weather),
    activityMatch: computeActivityMatchScore(
      breakdown.activityMatch,
      context.interestMatches,
      context.totalInterests,
    ),
    driveTime: computeDriveTimeScore(context.driveHours, context.driveLimitHours),
    alerts: clamp(breakdown.alerts),
    groupFit: computeGroupFitScore(breakdown.groupFit, context.groupMatchBoost),
    lodging: computeLodgingScore(breakdown.lodging, context.lodgingMatchBoost),
    planB: computePlanBScore(breakdown.planB, context.tripLengthMatch),
  };
}

export function calculateTripFitScore(
  breakdown: ScoreBreakdown,
  context?: ScoringContext,
): number {
  const resolved = resolveBreakdown(breakdown, context);
  const weighted = Object.entries(resolved).reduce((total, [metric, value]) => {
    return total + value * scoreWeights[metric as keyof ScoreBreakdown];
  }, 0);

  return Math.round(clamp(weighted));
}

export function labelTripFitScore(score: number) {
  if (score >= 85) {
    return "Excellent now";
  }

  if (score >= 74) {
    return "Good with caution";
  }

  if (score >= 62) {
    return "Mixed conditions";
  }

  return "Not ideal now";
}

export const tripFitScoreWeights = scoreWeights;
