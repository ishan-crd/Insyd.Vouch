"use client";

import { Plus } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { trackPosts } from "@/app/dashboard/actions";

export function TrackForm() {
  const [state, action, pending] = useActionState(trackPosts, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!pending && !state?.error) ref.current?.reset();
  }, [pending, state]);
  return (
    <form ref={ref} action={action} className="track-form panel">
      <div className="panel-body">
        <label className="field">
          <span>Track new posts <em>one link per line · re-checked every 2 hours</em></span>
          <textarea name="urls" rows={2} required className="mono-input" placeholder={"https://www.instagram.com/reel/C8xQ2Lm/"} />
        </label>
        <div className="track-form-foot">
          <label className="check">
            <input type="checkbox" name="includeSharesCount" /> Include shares count <span className="muted-sm">(+$10 / 1k)</span>
          </label>
          {state?.error && <span className="form-err">{state.error}</span>}
          <button className="btn btn-primary" disabled={pending}>
            <Plus size={16} /> {pending ? "Adding…" : "Start tracking"}
          </button>
        </div>
      </div>
    </form>
  );
}
