"use client";

import { ArrowRight } from "lucide-react";
import { useActionState } from "react";
import { signIn } from "@/app/(auth)/actions";
import { GoogleButton } from "./google-button";

export function LoginForm({ next, linkError }: { next?: string; linkError?: boolean }) {
  const [state, action, pending] = useActionState(signIn, undefined);
  return (
    <form action={action} className="auth-form">
      <GoogleButton next={next} />
      <div className="auth-divider"><span>or with email</span></div>
      <input type="hidden" name="next" value={next ?? "/dashboard"} />
      <label className="field">
        <span>Work email</span>
        <input name="email" type="email" autoComplete="email" required defaultValue={state?.email} placeholder="you@company.com" />
      </label>
      <label className="field">
        <span>Password</span>
        <input name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
      </label>
      {(state?.error || linkError) && <p className="auth-error">{state?.error ?? "That link has expired. Sign in, or request a new one."}</p>}
      <button className="btn btn-primary btn-lg auth-submit" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"} <ArrowRight size={17} />
      </button>
    </form>
  );
}
