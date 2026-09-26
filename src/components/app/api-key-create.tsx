"use client";

import { Check, Copy, KeyRound, Plus, X } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { createApiKey } from "@/app/dashboard/actions";

export function ApiKeyCreate() {
  const [state, action, pending] = useActionState(createApiKey, {});
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState<string>();
  const nameRef = useRef<HTMLInputElement>(null);
  const newKey = state.key && state.key !== dismissed ? state.key : null;
  const visible = open || Boolean(newKey);

  // The freshly created key must be acknowledged explicitly; only the name form closes on Escape / backdrop.
  const close = () => {
    if (!newKey) setOpen(false);
  };

  useEffect(() => {
    if (!visible) return;
    if (!newKey) nameRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !newKey && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, newKey]);

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
        <Plus size={16} /> Create key
      </button>
      {visible && (
        <div className="modal-back">
          <button type="button" className="modal-scrim" aria-label="Close" tabIndex={-1} onClick={close} />
          <div className="modal" role="dialog" aria-modal aria-labelledby="key-modal-title">
            {newKey ? (
              <>
                <div className="modal-icon">
                  <KeyRound size={20} />
                </div>
                <h3 id="key-modal-title">Copy your new key</h3>
                <p className="muted-sm">This is the only time it will be shown. Store it somewhere safe, like your secrets manager.</p>
                <div className="key-reveal">
                  <code>{newKey}</code>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      navigator.clipboard.writeText(newKey);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <button
                  type="button"
                  className="btn btn-primary modal-done"
                  onClick={() => {
                    setDismissed(newKey);
                    setOpen(false);
                  }}
                >
                  I&apos;ve saved it
                </button>
              </>
            ) : (
              <form action={action}>
                <button type="button" className="modal-x" onClick={close} aria-label="Close">
                  <X size={18} />
                </button>
                <h3 id="key-modal-title">Create an API key</h3>
                <p className="muted-sm">Give it a name you&apos;ll recognise later, like the project or client it&apos;s for.</p>
                <label className="field">
                  <span>Name</span>
                  <input ref={nameRef} name="name" placeholder="Production" maxLength={60} />
                </label>
                {state.error && <p className="auth-error">{state.error}</p>}
                <button type="submit" className="btn btn-primary modal-done" disabled={pending}>
                  {pending ? "Creating…" : "Create key"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
