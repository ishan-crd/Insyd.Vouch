"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; notice?: string; email?: string } | undefined;

const safeNext = (next: unknown) => (typeof next === "string" && next.startsWith("/dashboard") ? next : "/dashboard");

export async function signIn(_: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password.", email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const msg = /confirm/i.test(error.message)
      ? "Confirm your email first. Check your inbox for the link."
      : "That email and password don't match.";
    return { error: msg, email };
  }
  redirect(safeNext(form.get("next")));
}

const SignUp = z.object({
  fullName: z.string().trim().min(1, "Tell us your name.").max(80),
  company: z.string().trim().max(80).optional(),
  email: z.email("Enter a valid work email."),
  password: z.string().min(8, "Use at least 8 characters for your password."),
});

export async function signUp(_: AuthState, form: FormData): Promise<AuthState> {
  const parsed = SignUp.safeParse(Object.fromEntries(form));
  const email = String(form.get("email") ?? "");
  if (!parsed.success) return { error: parsed.error.issues[0].message, email };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName, company: parsed.data.company || null },
      emailRedirectTo: `${env.appUrl()}/auth/callback?next=/dashboard`,
    },
  });
  if (error) return { error: error.message, email };
  if (!data.session) return { notice: `We sent a confirmation link to ${parsed.data.email}. Click it to activate your account.`, email };
  redirect("/dashboard");
}
