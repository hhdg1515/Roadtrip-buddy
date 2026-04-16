import { NextResponse } from "next/server";
import { getRankedDestinations } from "@/lib/data/repository";
import { getPlanningState } from "@/lib/planning";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const planningState = getPlanningState(
    {
      origin: url.searchParams.get("origin") ?? undefined,
      tripLength: url.searchParams.get("tripLength") ?? undefined,
      startDate: url.searchParams.get("startDate") ?? undefined,
      drivingTolerance: url.searchParams.get("drivingTolerance") ?? undefined,
      groupProfile: url.searchParams.get("groupProfile") ?? undefined,
      tripFormat: url.searchParams.get("tripFormat") ?? undefined,
      tripIntensity: url.searchParams.get("tripIntensity") ?? undefined,
      lodgingStyle: url.searchParams.get("lodgingStyle") ?? undefined,
      interestMode: url.searchParams.get("interestMode") ?? undefined,
      interests: url.searchParams.getAll("interests"),
    },
    undefined,
  );

  const recommendations = (
    await getRankedDestinations(planningState.origin, planningState.tripLength, {
      startDate: planningState.startDate,
      drivingTolerance: planningState.drivingTolerance,
      groupProfile: planningState.groupProfile,
      tripFormat: planningState.tripFormat,
      tripIntensity: planningState.tripIntensity,
      lodgingStyle: planningState.lodgingStyle,
      interests: planningState.interests,
    })
  ).map(
    ({ rankingScore, ...destination }) => ({
      ...destination,
      rankingScore,
    }),
  );

  return NextResponse.json({
    origin: planningState.origin,
    tripLength: planningState.tripLength,
    startDate: planningState.startDate,
    drivingTolerance: planningState.drivingTolerance,
    groupProfile: planningState.groupProfile,
    tripFormat: planningState.tripFormat,
    tripIntensity: planningState.tripIntensity,
    lodgingStyle: planningState.lodgingStyle,
    interestMode: planningState.interestMode,
    interests: planningState.interests,
    recommendations,
  });
}
