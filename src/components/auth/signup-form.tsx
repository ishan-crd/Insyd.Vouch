"use client";

import { ArrowRight, MailCheck } from "lucide-react";
import { useActionState } from "react";
import { signUp } from "@/app/(auth)/actions";
import { GoogleButton } from "./google-button";

export function SignupForm() {
  const [state, action, pending] = useActionState(signUp, undefined);
  if (state?.notice) {
    return (
      <div className="auth-notice">
        <MailCheck size={22} />
        <p>{state.notice}</p>
      </div>
    );
  }
  return (
    <form action={action} className="auth-form">
      <GoogleButton />
      <div className="auth-divider">
        <span>or with email</span>
      </div>
      <div className="field-row">
        <label className="field">
          <span>Full name</span>
          <input name="fullName" autoComplete="name" required placeholder="Ada Lovelace" />
        </label>
        <label className="field">
          <span>
            Company <em>optional</em>
          </span>
          <input name="company" autoComplete="organization" placeholder="Acme Social" />
        </label>
      </div>
      <label className="field">
        <span>Work email</span>
        <input name="email" type="email" autoComplete="email" required defaultValue={state?.email} placeholder="you@company.com" />
      </label>
      <label className="field">
        <span>Password</span>
        <input name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="At least 8 characters" />
      </label>
      {state?.error && <p className="auth-error">{state.error}</p>}
      <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={pending}>
        {pending ? "Creating account…" : "Create account"} <ArrowRight size={17} />
      </button>
    </form>
  );
}
