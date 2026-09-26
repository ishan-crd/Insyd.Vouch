"use client";

import { Check } from "lucide-react";
import { useActionState } from "react";
import { saveWebhook, updateProfile } from "@/app/dashboard/actions";

export function ProfileForm({ fullName, company, email }: { fullName: string; company: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  return (
    <form action={action} className="panel-body">
      <div className="grid-2">
        <label className="field"><span>Full name</span><input name="fullName" defaultValue={fullName} /></label>
        <label className="field"><span>Company</span><input name="company" defaultValue={company} /></label>
      </div>
      <label className="field"><span>Email</span><input value={email} disabled /></label>
      <div className="form-foot">
        {state?.saved && !pending && <span className="saved"><Check size={14} /> Saved</span>}
        <button className="btn btn-primary btn-sm" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}

export function WebhookForm({ url }: { url: string }) {
  const [state, action, pending] = useActionState(saveWebhook, undefined);
  return (
    <form action={action} className="webhook-form">
      <label className="field">
        <span>Endpoint URL</span>
        <input name="url" type="url" defaultValue={url} placeholder="https://example.com/hooks/vouch" />
      </label>
      <div className="form-foot">
        {state?.error && <span className="form-err">{state.error}</span>}
        {state?.saved && !pending && <span className="saved"><Check size={14} /> Saved</span>}
        <button className="btn btn-primary btn-sm" disabled={pending}>{pending ? "Saving…" : "Save endpoint"}</button>
      </div>
    </form>
  );
}
