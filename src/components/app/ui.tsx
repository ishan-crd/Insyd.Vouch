import { Check, Clock, Loader2, X } from "lucide-react";
import type { ReactNode } from "react";

export function PageHead({ title, sub, actions, back }: { title: ReactNode; sub?: ReactNode; actions?: ReactNode; back?: ReactNode }) {
  return (
    <header className="phead">
      <div className="phead-main">
        {back}
        <div>
          <h1>{title}</h1>
          {sub && <div className="phead-sub">{sub}</div>}
        </div>
      </div>
      {actions && <div className="phead-actions">{actions}</div>}
    </header>
  );
}

const STATUS: Record<string, { cls: string; label: string; icon: ReactNode }> = {
  SUCCEEDED: { cls: "ok", label: "Succeeded", icon: <Check size={12} strokeWidth={3} /> },
  RUNNING: { cls: "run", label: "Running", icon: <Loader2 size={12} className="spin" /> },
  READY: { cls: "run", label: "Starting", icon: <Clock size={12} /> },
  FAILED: { cls: "bad", label: "Failed", icon: <X size={12} strokeWidth={3} /> },
  ABORTED: { cls: "bad", label: "Aborted", icon: <X size={12} strokeWidth={3} /> },
  "TIMED-OUT": { cls: "bad", label: "Timed out", icon: <Clock size={12} /> },
  active: { cls: "ok", label: "Tracking", icon: <span className="live-dot" /> },
  paused: { cls: "muted", label: "Paused", icon: <Clock size={12} /> },
  ended: { cls: "muted", label: "Stopped", icon: <Check size={12} /> },
  error: { cls: "bad", label: "Error", icon: <X size={12} /> },
};

export function StatusBadge({ status, children }: { status: string; children?: ReactNode }) {
  const s = STATUS[status] ?? { cls: "muted", label: status, icon: null };
  return (
    <span className={`badge badge-${s.cls}`}>
      {s.icon}
      {children ?? s.label}
    </span>
  );
}

export function OriginTag({ origin }: { origin: string }) {
  const label = origin === "WEB" ? "Web" : origin === "API" ? "API" : "Schedule";
  return <span className="tag-mono">{label}</span>;
}

export function Empty({ icon, title, children, action }: { icon: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function Kpi({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="kpi">
      <span>{label}</span>
      <b>{value}</b>
      {hint && <small>{hint}</small>}
    </div>
  );
}
