"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sanitizeNextPath } from "@/lib/safe-next-path";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getAppBaseUrl } from "@/lib/site-url";

export async function requestMagicLinkAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/profile?status=supabase-missing");
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const next = sanitizeNextPath(String(formData.get("next") ?? "/profile"));

  if (!email || !email.includes("@")) {
    redirect(`/profile?status=invalid-email&next=${encodeURIComponent(next)}`);
  }

  const baseUrl = await getAppBaseUrl();
  const callbackUrl = new URL("/auth/callback", baseUrl);
  callbackUrl.searchParams.set("next", next);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl.toString(),
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error("Failed to request magic link.", error);
    redirect(`/profile?status=auth-error&next=${encodeURIComponent(next)}`);
  }

  redirect(`/profile?status=check-email&next=${encodeURIComponent(next)}`);
}

export async function signOutAction() {
  if (!hasSupabaseEnv()) {
    redirect("/profile?status=supabase-missing");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Failed to sign out.", error);
    redirect("/profile?status=auth-error");
  }

  revalidatePath("/profile");
  revalidatePath("/saved");
  redirect("/profile?status=signed-out");
}

export async function savePreferencesAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/profile?status=supabase-missing");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/profile?status=sign-in-required");
  }

  const payload = {
    user_id: user.id,
    origin_city: normalizeText(formData.get("originCity")),
    driving_tolerance: normalizeText(formData.get("drivingTolerance")),
    favorite_activities: parseList(formData.get("favoriteActivities")),
    group_default: normalizeText(formData.get("groupDefault")),
    lodging_preference: normalizeText(formData.get("lodgingPreference")),
    avoidances: parseList(formData.get("avoidances")),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("user_preferences")
    .upsert(payload, { onConflict: "user_id" });

  if (error) {
    console.error("Failed to save user preferences.", error);
    redirect("/profile?status=preferences-error");
  }

  revalidatePath("/profile");
  redirect("/profile?status=preferences-saved");
}

function normalizeText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function parseList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}
