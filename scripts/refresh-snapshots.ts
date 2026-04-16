import { loadScriptEnv } from "./lib/env";
import { refreshDestinationSnapshots } from "./lib/condition-sync";

loadScriptEnv();

refreshDestinationSnapshots()
  .then((result) => {
    console.log("Snapshot refresh complete.");
    console.log(`destination snapshots refreshed: ${result.refreshed}`);
    console.log(`seasonality month used: ${result.month}`);
  })
  .catch((error) => {
    console.error("Snapshot refresh failed.");
    console.error(error);
    process.exit(1);
  });
