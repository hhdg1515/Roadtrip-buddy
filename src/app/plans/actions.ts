"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
} from "@/lib/data/openseason";
import { getDestinationBySlugFromRepository } from "@/lib/data/repository";
import {
  isInterestKey,
  parseDrivingTolerance,
  parseGroupProfile,
  parseInterestMode,
  parseLodgingStyle,
  parseOrigin,
  parseStartDate,
  parseTripFormat,
  parseTripIntensity,
  parseTripLength,
} from "@/lib/planning-params";
import { sanitizeNextPath } from "@/lib/safe-next-path";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function saveTripPlanAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/profile?status=supabase-missing");
  }

  const slug = String(formData.get("slug") ?? "").trim();
  const returnTo = sanitizeNextPath(String(formData.get("returnTo") ?? "/saved"), "/saved");
  const origin = parseOrigin(String(formData.get("origin") ?? ""));
  const tripLength = parseTripLength(String(formData.get("tripLength") ?? ""));
  const startDate = parseStartDate(String(formData.get("startDate") ?? ""));
  const drivingTolerance = parseDrivingTolerance(String(formData.get("drivingTolerance") ?? ""));
  const groupProfile = parseGroupProfile(String(formData.get("groupProfile") ?? ""));
  const tripFormat = parseTripFormat(String(formData.get("tripFormat") ?? ""));
  const tripIntensity = parseTripIntensity(String(formData.get("tripIntensity") ?? ""));
  const lodgingStyle = parseLodgingStyle(String(formData.get("lodgingStyle") ?? ""));
  const interestMode = parseInterestMode(String(formData.get("interestMode") ?? ""));
  const interests = formData.getAll("interests").map(String).filter(isInterestKey);
  const resolvedInterests = interestMode === "open" ? [] : interests;

  if (!slug) {
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}status=save-error`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/profile?next=${encodeURIComponent(returnTo)}&status=sign-in-required`);
  }

  const [destination, destinationLookup] = await Promise.all([
    getDestinationBySlugFromRepository(slug),
    supabase
      .from("destinations")
      .select("id, slug")
      .eq("slug", slug)
      .maybeSingle(),
  ]);

  if (destinationLookup.error || !destinationLookup.data?.id || !destination) {
    console.error("Failed to resolve destination for save.", destinationLookup.error);
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}status=save-error`);
  }

  const existingPlanResponse = await supabase
    .from("trip_plans")
    .select("id, title")
    .eq("user_id", user.id)
    .eq("destination_id", destinationLookup.data.id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (existingPlanResponse.error) {
    console.error("Failed to inspect existing saved trip.", existingPlanResponse.error);
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}status=save-error`);
  }

  const existingPlanId = (
    (existingPlanResponse.data ?? []) as Array<{
      id: string;
      title?: string | null;
    }>
  ).find(Boolean)?.id;
  const existingPlanTitle = (
    (existingPlanResponse.data ?? []) as Array<{
      id: string;
      title?: string | null;
    }>
  ).find(Boolean)?.title;

  const payload = {
    user_id: user.id,
    destination_id: destinationLookup.data.id,
    title: existingPlanTitle?.trim() || `${destination.name} live road trip plan`,
    user_origin: origin ?? "bay-area",
    group_type: groupProfile ?? "mixed",
    preferences: {
      tripLength: tripLength ?? "3-days",
      startDate,
      drivingTolerance: drivingTolerance ?? "balanced",
      interests: resolvedInterests,
      groupProfile: groupProfile ?? "mixed",
      tripFormat: tripFormat ?? "one-night",
      tripIntensity: tripIntensity ?? "balanced",
      lodgingStyle: lodgingStyle ?? "town-base",
      interestMode: interestMode ?? "specific",
    },
    generated_plan: {
      fitScore: destination.fitScore,
      fitLabel: destination.fitLabel,
      currentVerdict: destination.currentVerdict,
      whyNow: destination.whyNow,
      itinerary: destination.itinerary,
      lodging: destination.lodging,
      liveWeather: destination.liveWeather ?? null,
      activeAlerts: destination.activeAlerts ?? [],
      updatedAt: destination.updatedAt ?? null,
    },
    plan_b: destination.planB,
  };

  const writeResponse = existingPlanId
    ? await supabase.from("trip_plans").update(payload).eq("id", existingPlanId)
    : await supabase.from("trip_plans").insert(payload);

  if (writeResponse.error) {
    console.error("Failed to save trip plan.", writeResponse.error);
    redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}status=save-error`);
  }

  revalidatePath("/saved");
  revalidatePath("/profile");
  revalidatePath(returnTo);
  redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}saved=1`);
}
