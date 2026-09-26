import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";

const SAMPLE = `{
  "ownerUsername": "nomad.eats",
  "videoViewCount": 1094600,
  "likesCount": 78811,
  "commentsCount": 1970,
  "tracking": { "interval": "2h" }
}`;

export function AuthShell({ title, subtitle, children, footer }: { title: ReactNode; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="auth">
      <div className="auth-form-side">
        <Link href="/" className="auth-logo"><Logo /></Link>
        <div className="auth-form-wrap">
          <h1 className="auth-title">{title}</h1>
          <p className="auth-sub">{subtitle}</p>
          {children}
          <p className="auth-foot">{footer}</p>
        </div>
        <p className="auth-legal">© {new Date().getFullYear()} Insyd · Not affiliated with Instagram or Meta.</p>
      </div>
      <aside className="auth-art" aria-hidden>
        <div className="cta-grid-bg" />
        <div className="auth-art-inner">
          <p className="auth-quote">
            Every view, like and share. <span className="serif">Vouched for.</span>
          </p>
          <div className="terminal auth-code">
            <div className="window-bar"><i /><i /><i /><span className="url">GET /v1/runs/run_8fK2/items</span></div>
            <pre>{SAMPLE}</pre>
          </div>
          <ul className="auth-points">
            <li>$4 per 1,000 results, pay as you go</li>
            <li>Posts re-checked every 2 hours</li>
            <li>30+ fields per post, as clean JSON</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
