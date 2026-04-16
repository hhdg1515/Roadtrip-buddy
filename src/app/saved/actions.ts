"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function deleteSavedTripAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/profile?status=supabase-missing");
  }

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    redirect("/saved?status=delete-error");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/profile?next=%2Fsaved&status=sign-in-required");
  }

  const { error } = await supabase
    .from("trip_plans")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to delete saved trip.", error);
    redirect("/saved?status=delete-error");
  }

  revalidatePath("/saved");
  revalidatePath("/profile");
  redirect("/saved?status=deleted");
}

export async function renameSavedTripAction(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/profile?status=supabase-missing");
  }

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();

  if (!id || title.length === 0) {
    redirect("/saved?status=rename-error");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/profile?next=%2Fsaved&status=sign-in-required");
  }

  const { error } = await supabase
    .from("trip_plans")
    .update({
      title: title.slice(0, 120),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to rename saved trip.", error);
    redirect("/saved?status=rename-error");
  }

  revalidatePath("/saved");
  revalidatePath("/profile");
  redirect("/saved?status=renamed");
}
