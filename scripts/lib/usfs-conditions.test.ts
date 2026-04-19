import assert from "node:assert/strict";
import test from "node:test";

import {
  mapUsfsConditionSeverity,
  parseUsfsConditionsPage,
  selectRelevantUsfsConditionLines,
  type UsfsConditionsWatchConfig,
} from "./usfs-conditions";

const sampleHtml = `
  <div>
    <p>Last updated April 14, 2026</p>
    <h2>Road Conditions</h2>
    <p>Closed Huntington Lake Road (T2) due to snow and winter damage.</p>
    <p>Kaiser Pass Road is open with caution near the summit.</p>
    <p>Fire danger status is available elsewhere.</p>
    <p>McCloud River Loop Road remains closed for storm recovery.</p>
  </div>
`;

const shaverWatch: UsfsConditionsWatchConfig = {
  forestName: "Sierra National Forest",
  conditionsUrl: "https://www.fs.usda.gov/r05/sierra/conditions",
  corridorHints: ["Huntington", "Kaiser", "Shaver"],
  maxAlerts: 4,
};

test("parseUsfsConditionsPage extracts last updated and normalized lines", () => {
  const page = parseUsfsConditionsPage(sampleHtml);

  assert.match(page.lastUpdated ?? "", /^2026-04-14T/);
  assert.ok(page.lines.includes("Closed Huntington Lake Road (T2) due to snow and winter damage."));
});

test("selectRelevantUsfsConditionLines keeps hinted operational lines and drops noise", () => {
  const page = parseUsfsConditionsPage(sampleHtml);
  const lines = selectRelevantUsfsConditionLines(page, shaverWatch);

  assert.deepEqual(lines, [
    "Closed Huntington Lake Road (T2) due to snow and winter damage.",
    "Kaiser Pass Road is open with caution near the summit.",
  ]);
});

test("mapUsfsConditionSeverity maps closure and caution lines", () => {
  assert.equal(
    mapUsfsConditionSeverity("Closed Huntington Lake Road (T2) due to snow and winter damage."),
    "Severe",
  );
  assert.equal(
    mapUsfsConditionSeverity("Kaiser Pass Road is open with caution near the summit."),
    "Moderate",
  );
});
