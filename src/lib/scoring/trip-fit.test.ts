import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateTripFitScore,
  computeActivityMatchScore,
  computeDriveTimeScore,
  computeSeasonalityScore,
  labelTripFitScore,
  resolveBreakdown,
  type ScoreBreakdown,
  type ScoringContext,
} from "./trip-fit";

const baseBreakdown: ScoreBreakdown = {
  seasonality: 80,
  weather: 80,
  activityMatch: 80,
  driveTime: 80,
  alerts: 80,
  groupFit: 80,
  lodging: 80,
  planB: 80,
};

const neutralContext: ScoringContext = {
  driveHours: 3,
  driveLimitHours: 4,
  isInBestMonth: false,
  isInAvoidMonth: false,
  interestMatches: 0,
  totalInterests: 0,
  groupMatchBoost: 0,
  tripLengthMatch: true,
  lodgingMatchBoost: 0,
};

describe("computeDriveTimeScore", () => {
  it("returns near 100 for trivial drives", () => {
    assert.ok(computeDriveTimeScore(0.5, 4) >= 95);
  });

  it("penalises drives that exceed the user's tolerance", () => {
    const inside = computeDriveTimeScore(3, 4);
    const outside = computeDriveTimeScore(7, 4);
    assert.ok(outside < inside);
    assert.ok(outside < 50);
  });

  it("clamps to 0..100", () => {
    assert.equal(computeDriveTimeScore(20, 4), 0);
    assert.ok(computeDriveTimeScore(0, 4) <= 100);
  });
});

describe("computeSeasonalityScore", () => {
  it("boosts when the trip is in a best month", () => {
    assert.ok(computeSeasonalityScore(70, true, false) > 70);
  });

  it("deeply penalises trips in avoid months", () => {
    assert.ok(computeSeasonalityScore(70, false, true) < 40);
  });

  it("slightly cools neutral months", () => {
    assert.ok(computeSeasonalityScore(70, false, false) < 70);
  });
});

describe("computeActivityMatchScore", () => {
  it("returns baseline when no interests selected", () => {
    assert.equal(computeActivityMatchScore(75, 0, 0), 75);
  });

  it("boosts when all interests match", () => {
    assert.ok(computeActivityMatchScore(75, 3, 3) > 75);
  });

  it("penalises when no interests match", () => {
    assert.ok(computeActivityMatchScore(75, 0, 3) < 75);
  });
});

describe("calculateTripFitScore", () => {
  it("produces the same result as the plain weighted sum when no context is supplied", () => {
    const score = calculateTripFitScore(baseBreakdown);
    assert.equal(score, 80);
  });

  it("changes when origin (via driveHours) changes", () => {
    const near = calculateTripFitScore(baseBreakdown, { ...neutralContext, driveHours: 1 });
    const far = calculateTripFitScore(baseBreakdown, { ...neutralContext, driveHours: 9 });
    assert.ok(far < near, "far drives should score lower than short drives");
  });

  it("changes when start date moves into an avoid month", () => {
    const inSeason = calculateTripFitScore(baseBreakdown, {
      ...neutralContext,
      isInBestMonth: true,
    });
    const offSeason = calculateTripFitScore(baseBreakdown, {
      ...neutralContext,
      isInAvoidMonth: true,
    });
    assert.ok(offSeason < inSeason);
  });

  it("changes when interests shift", () => {
    const matched = calculateTripFitScore(baseBreakdown, {
      ...neutralContext,
      interestMatches: 3,
      totalInterests: 3,
    });
    const missed = calculateTripFitScore(baseBreakdown, {
      ...neutralContext,
      interestMatches: 0,
      totalInterests: 3,
    });
    assert.ok(matched > missed);
  });

  it("stays within 0..100", () => {
    const worst = calculateTripFitScore(
      { ...baseBreakdown, seasonality: 0, weather: 0, alerts: 0 },
      {
        ...neutralContext,
        driveHours: 20,
        isInAvoidMonth: true,
        interestMatches: 0,
        totalInterests: 4,
        groupMatchBoost: -30,
        tripLengthMatch: false,
        lodgingMatchBoost: -30,
      },
    );
    assert.ok(worst >= 0 && worst <= 100);
  });
});

describe("resolveBreakdown", () => {
  it("returns clamped breakdown when no context is provided", () => {
    const out = resolveBreakdown({ ...baseBreakdown, seasonality: 150, weather: -20 });
    assert.equal(out.seasonality, 100);
    assert.equal(out.weather, 0);
  });
});

describe("labelTripFitScore", () => {
  it("uses PRD §38 labels", () => {
    assert.equal(labelTripFitScore(90), "Excellent now");
    assert.equal(labelTripFitScore(78), "Good with caution");
    assert.equal(labelTripFitScore(66), "Mixed conditions");
    assert.equal(labelTripFitScore(40), "Not ideal now");
  });
});
