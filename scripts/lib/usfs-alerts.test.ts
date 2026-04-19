import assert from "node:assert/strict";
import test from "node:test";

import {
  mapUsfsSeverity,
  parseUsfsAlertsPage,
  selectRelevantUsfsAlerts,
  type UsfsWatchConfig,
} from "./usfs-alerts";

const sampleHtml = `
  <ul class="usa-card-group">
    <li class="usa-card usa-card--flag wfs-alert-flag critical">
      <div class="usa-card__container">
        <header class="usa-card__header">
          <h3 class="alert_level--critical">
            <a href="/r05/angeles/alerts/mt-baldy-trails-closure"><span>Mt. Baldy Trails Closure</span></a>
          </h3>
        </header>
        <div class="usa-card__body">
          Trail access is closed in the Mt. Baldy area under Forest Order No. 05-01-24-04.
        </div>
        <footer class="usa-card__footer">
          <strong>Alert Start Date:</strong> June 14, 2024
          <strong>Forest Order:</strong> #05-01-24-04
        </footer>
      </div>
    </li>
    <li class="usa-card usa-card--flag wfs-alert-flag information">
      <div class="usa-card__container">
        <header class="usa-card__header">
          <h3 class="alert_level--information">
            <a href="/r05/angeles/alerts/office-visitor-center-updates"><span>Office &amp; Visitor Center Updates</span></a>
          </h3>
        </header>
        <div class="usa-card__body">
          Please check office hours before visiting.
        </div>
      </div>
    </li>
    <li class="usa-card usa-card--flag wfs-alert-flag fire-restriction">
      <div class="usa-card__container">
        <header class="usa-card__header">
          <h3 class="alert_level--fire-restriction">
            <a href="/r05/angeles/alerts/forest-wide-fire-restrictions"><span>Forest-wide Fire Restrictions</span></a>
          </h3>
        </header>
        <div class="usa-card__body">
          Stage II fire restrictions are now active across the forest.
        </div>
      </div>
    </li>
  </ul>
`;

const angelesWatch: UsfsWatchConfig = {
  forestName: "Angeles National Forest",
  alertsUrl: "https://www.fs.usda.gov/r05/angeles/alerts",
  corridorHints: ["Mt. Baldy", "Angeles Crest", "Wrightwood", "San Gabriel"],
  maxAlerts: 4,
};

test("parseUsfsAlertsPage parses card markup into structured alerts", () => {
  const alerts = parseUsfsAlertsPage(sampleHtml, angelesWatch.alertsUrl);

  assert.equal(alerts.length, 3);
  assert.equal(alerts[0]?.title, "Mt. Baldy Trails Closure");
  assert.equal(
    alerts[0]?.href,
    "https://www.fs.usda.gov/r05/angeles/alerts/mt-baldy-trails-closure",
  );
  assert.equal(alerts[0]?.forestOrder, "#05-01-24-04");
  assert.match(alerts[0]?.effectiveDate ?? "", /^2024-06-14T/);
});

test("selectRelevantUsfsAlerts keeps corridor-specific and forestwide operational alerts", () => {
  const alerts = parseUsfsAlertsPage(sampleHtml, angelesWatch.alertsUrl);
  const relevant = selectRelevantUsfsAlerts(alerts, angelesWatch);

  assert.deepEqual(
    relevant.map((alert) => alert.title),
    ["Mt. Baldy Trails Closure", "Forest-wide Fire Restrictions"],
  );
});

test("mapUsfsSeverity maps USFS card classes into alert severities", () => {
  assert.equal(mapUsfsSeverity("critical"), "Severe");
  assert.equal(mapUsfsSeverity("fire-restriction"), "Moderate");
  assert.equal(mapUsfsSeverity("caution"), "Moderate");
  assert.equal(mapUsfsSeverity("information"), "Minor");
});
