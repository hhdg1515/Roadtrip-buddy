"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUserPreferences } from "@/lib/account";
import { getPlanningState, toPlanningQueryString } from "@/lib/planning";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function completeOnboardingAction(formData: FormData) {
  const interestValues = formData.getAll("interests").map(String);
  let savedToProfile = false;
  const planningState = getPlanningState(
    {
      origin: String(formData.get("origin") ?? ""),
      drivingTolerance: String(formData.get("drivingTolerance") ?? ""),
      groupProfile: String(formData.get("groupProfile") ?? ""),
      interestMode: String(formData.get("interestMode") ?? ""),
      interests: interestValues,
    },
    undefined,
  );

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      savedToProfile = true;
      const { preferences } = await getUserPreferences();
      const payload = {
        user_id: user.id,
        origin_city: planningState.origin,
        driving_tolerance: planningState.drivingTolerance,
        favorite_activities: planningState.interests,
        group_default: planningState.groupProfile,
        lodging_preference: planningState.lodgingStyle,
        avoidances: preferences.avoidances,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("user_preferences")
        .upsert(payload, { onConflict: "user_id" });

      if (error) {
        console.error("Failed to save onboarding defaults.", error);
      } else {
        revalidatePath("/");
        revalidatePath("/profile");
      }
    }
  }

  const query = toPlanningQueryString({
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
  });

  redirect(
    `/plan?${query}&status=${savedToProfile ? "onboarding-complete" : "onboarding-session-only"}`,
  );
}
