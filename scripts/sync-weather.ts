import { loadScriptEnv } from "./lib/env";
import { syncWeatherSnapshots } from "./lib/condition-sync";

loadScriptEnv();

syncWeatherSnapshots()
  .then((result) => {
    console.log("Weather sync complete.");
    console.log(`weather snapshots updated: ${result.synced}`);
    console.log(`snapshot date: ${result.snapshotDate}`);
  })
  .catch((error) => {
    console.error("Weather sync failed.");
    console.error(error);
    process.exit(1);
  });
