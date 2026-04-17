import { loadScriptEnv } from "./lib/env";
import {
  refreshDestinationSnapshots,
  syncAlerts,
  syncWeatherSnapshots,
} from "./lib/condition-sync";

loadScriptEnv();

async function main() {
  const weather = await syncWeatherSnapshots();
  const alerts = await syncAlerts();
  const snapshots = await refreshDestinationSnapshots();

  console.log("Condition sync complete.");
  console.log(`weather snapshots updated: ${weather.synced}`);
  console.log(`alerts inserted: ${alerts.synced}`);
  console.log(`caltrans alerts: ${alerts.caltransCount}`);
  console.log(`destination snapshots refreshed: ${snapshots.refreshed}`);
}

main().catch((error) => {
  console.error("Condition sync failed.");
  console.error(error);
  process.exit(1);
});
