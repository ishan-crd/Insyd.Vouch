import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Landing point for email confirmation and OAuth: swaps the one-time code for a session. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";
  const dest = next.startsWith("/dashboard") ? next : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(dest, url.origin));
  }
  return NextResponse.redirect(new URL("/login?error=link", url.origin));
}
