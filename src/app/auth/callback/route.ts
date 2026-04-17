import { NextResponse } from "next/server";
import { sanitizeNextPath } from "@/lib/safe-next-path";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = sanitizeNextPath(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/profile?status=auth-error", requestUrl.origin));
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Failed to exchange magic-link code.", error);
      return NextResponse.redirect(new URL("/profile?status=auth-error", requestUrl.origin));
    }
  } catch (error) {
    console.error("Unexpected auth callback error.", error);
    return NextResponse.redirect(new URL("/profile?status=auth-error", requestUrl.origin));
  }

  const redirectUrl = new URL(next, requestUrl.origin);
  redirectUrl.searchParams.set("status", "signed-in");

  return NextResponse.redirect(redirectUrl);
}
