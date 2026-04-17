import { loadScriptEnv } from "./lib/env";
import { syncAlerts } from "./lib/condition-sync";

loadScriptEnv();

syncAlerts()
  .then((result) => {
    console.log("Alert sync complete.");
    console.log(`alerts inserted: ${result.synced}`);
    console.log(`nws alerts: ${result.nwsCount}`);
    console.log(`nps alerts: ${result.npsCount}`);
    console.log(`caltrans alerts: ${result.caltransCount}`);
  })
  .catch((error) => {
    console.error("Alert sync failed.");
    console.error(error);
    process.exit(1);
  });
