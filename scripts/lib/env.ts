import path from "node:path";
import { config as loadEnv } from "dotenv";

let didLoad = false;

export function loadScriptEnv() {
  if (didLoad) {
    return;
  }

  loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
  loadEnv({ path: path.resolve(process.cwd(), ".env") });
  didLoad = true;
}

export function getSupabaseAdminEnv() {
  loadScriptEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY ?? "";

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL and a server-side Supabase key in .env.local.",
    );
  }

  return { url, serviceRoleKey };
}

export function getNwsUserAgent() {
  loadScriptEnv();

  const site = process.env.OPENSEASON_SITE_URL ?? "https://openseason.local";
  const email = process.env.NWS_CONTACT_EMAIL ?? "dev@openseason.local";

  return `OpenSeason/0.1 (${site}; ${email})`;
}

export function getNpsApiKey() {
  loadScriptEnv();
  return process.env.NPS_API_KEY ?? "";
}
