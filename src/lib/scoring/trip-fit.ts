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

export function calculateTripFitScore(breakdown: ScoreBreakdown) {
  const weighted = Object.entries(breakdown).reduce((total, [metric, value]) => {
    return total + value * scoreWeights[metric as keyof ScoreBreakdown];
  }, 0);

  return Math.round(weighted);
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
