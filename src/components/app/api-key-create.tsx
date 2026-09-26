"use client";

import { Check, Copy, KeyRound, Plus, X } from "lucide-react";
import { useActionState, useState } from "react";
import { createApiKey } from "@/app/dashboard/actions";

export function ApiKeyCreate() {
  const [state, action, pending] = useActionState(createApiKey, {});
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState<string>();
  const showKey = state.key && state.key !== dismissed;

  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}><Plus size={16} /> Create key</button>
      {(open || showKey) && (
        <div className="modal-back" onClick={() => !showKey && setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
            {showKey ? (
              <>
                <div className="modal-icon"><KeyRound size={20} /></div>
                <h3>Copy your new key</h3>
                <p className="muted-sm">This is the only time it will be shown. Store it somewhere safe, like your secrets manager.</p>
                <div className="key-reveal">
                  <code>{state.key}</code>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      navigator.clipboard.writeText(state.key!);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <button className="btn btn-primary modal-done" onClick={() => { setDismissed(state.key); setOpen(false); }}>I&apos;ve saved it</button>
              </>
            ) : (
              <form action={action}>
                <button type="button" className="modal-x" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
                <h3>Create an API key</h3>
                <p className="muted-sm">Give it a name you&apos;ll recognise later, like the project or client it&apos;s for.</p>
                <label className="field">
                  <span>Name</span>
                  <input name="name" autoFocus placeholder="Production" maxLength={60} />
                </label>
                {state.error && <p className="auth-error">{state.error}</p>}
                <button className="btn btn-primary modal-done" disabled={pending}>{pending ? "Creating…" : "Create key"}</button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
