import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getDecisionStatus } from "./decision-layer";

describe("getDecisionStatus", () => {
  it("treats full route closures as a block-level decision", () => {
    const status = getDecisionStatus(
      [
        {
          source: "caltrans",
          alertType: "Road access",
          severity: "Severe",
          title: "SR-120 full closure near Groveland",
          description: "Road closed in both directions.",
        },
      ],
      {
        snapshotDate: "2026-04-16",
        highTemp: 62,
        lowTemp: 41,
        precipitationProbability: 10,
        windSpeed: 9,
        snowRisk: 0,
        heatRisk: 0,
      },
    );

    assert.equal(status.level, "block");
    assert.equal(status.label, "Block");
    assert.equal(status.signals[0]?.label, "Hard access block is active");
  });

  it("treats official warnings as warn-level when there is no hard block", () => {
    const status = getDecisionStatus(
      [
        {
          source: "nws",
          alertType: "Red Flag Warning",
          severity: "Severe",
          title: "Red Flag Warning for gusty wind and low humidity",
          description: "Critical fire weather conditions.",
        },
      ],
      {
        snapshotDate: "2026-04-16",
        highTemp: 74,
        lowTemp: 52,
        precipitationProbability: 5,
        windSpeed: 24,
        snowRisk: 0,
        heatRisk: 8,
      },
    );

    assert.equal(status.level, "warn");
    assert.equal(status.label, "Warn");
  });

  it("uses weather alone as a warn-level signal when exposure is strong enough", () => {
    const status = getDecisionStatus([], {
      snapshotDate: "2026-04-16",
      highTemp: 101,
      lowTemp: 76,
      precipitationProbability: 0,
      windSpeed: 12,
      snowRisk: 0,
      heatRisk: 86,
    });

    assert.equal(status.level, "warn");
    assert.match(status.headline, /Heat exposure/i);
  });

  it("falls back to inform when no hard or warning signals are present", () => {
    const status = getDecisionStatus([], {
      snapshotDate: "2026-04-16",
      highTemp: 64,
      lowTemp: 45,
      precipitationProbability: 20,
      windSpeed: 11,
      snowRisk: 0,
      heatRisk: 0,
    });

    assert.equal(status.level, "inform");
    assert.equal(status.label, "Inform");
  });

  it("keeps block ahead of warn when both are present", () => {
    const status = getDecisionStatus(
      [
        {
          source: "nws",
          alertType: "Red Flag Warning",
          severity: "Severe",
          title: "Critical fire weather conditions",
          description: null,
        },
        {
          source: "caltrans",
          alertType: "Road access",
          severity: "Severe",
          title: "SR-2 full closure near Wrightwood",
          description: "Full closure remains in effect.",
        },
      ],
      {
        snapshotDate: "2026-04-16",
        highTemp: 68,
        lowTemp: 40,
        precipitationProbability: 10,
        windSpeed: 31,
        snowRisk: 0,
        heatRisk: 0,
      },
    );

    assert.equal(status.level, "block");
    assert.match(status.guidance, /hard access constraint/i);
  });
});

