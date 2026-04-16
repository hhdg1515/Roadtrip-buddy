import { NextResponse } from "next/server";
import {
  refreshDestinationSnapshots,
  syncAlerts,
  syncWeatherSnapshots,
} from "../../../../../scripts/lib/condition-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleSyncRequest(request);
}

export async function POST(request: Request) {
  return handleSyncRequest(request);
}

async function handleSyncRequest(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  const providedSecret = getProvidedSecret(request);

  if (!expectedSecret) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing CRON_SECRET.",
      },
      { status: 500 },
    );
  }

  if (providedSecret !== expectedSecret) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unauthorized.",
      },
      { status: 401 },
    );
  }

  const startedAt = new Date().toISOString();

  try {
    const weather = await syncWeatherSnapshots();
    const alerts = await syncAlerts();
    const snapshots = await refreshDestinationSnapshots();

    return NextResponse.json({
      ok: true,
      startedAt,
      finishedAt: new Date().toISOString(),
      weather,
      alerts,
      snapshots,
    });
  } catch (error) {
    console.error("Condition sync route failed.", error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Condition sync failed.",
      },
      { status: 500 },
    );
  }
}

function getProvidedSecret(request: Request) {
  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  return request.headers.get("x-cron-secret");
}
