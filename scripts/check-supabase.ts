import path from "node:path";
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
loadEnv({ path: path.resolve(process.cwd(), ".env") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !anonKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL and a public key in .env.local.",
  );
  process.exit(1);
}

async function main() {
  const supabase = createClient(url!, anonKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const [destinationsResult, snapshotsResult] = await Promise.all([
    supabase.from("destinations").select("*", { count: "exact", head: true }),
    supabase
      .from("destination_content_snapshots")
      .select("*", { count: "exact", head: true }),
  ]);

  if (destinationsResult.error) {
    throw destinationsResult.error;
  }

  if (snapshotsResult.error) {
    throw snapshotsResult.error;
  }

  const sampleResult = await supabase
    .from("destinations")
    .select("slug, name")
    .order("name", { ascending: true })
    .limit(10);

  if (sampleResult.error) {
    throw sampleResult.error;
  }

  console.log("Supabase connection looks good.");
  console.log(`destinations: ${destinationsResult.count ?? 0}`);
  console.log(`destination_content_snapshots: ${snapshotsResult.count ?? 0}`);

  if ((sampleResult.data ?? []).length > 0) {
    console.log("sample destinations:");
    for (const row of sampleResult.data ?? []) {
      console.log(`- ${row.slug}: ${row.name}`);
    }
  }
}

main().catch((error) => {
  console.error("Supabase check failed.");
  console.error(error);
  process.exit(1);
});
