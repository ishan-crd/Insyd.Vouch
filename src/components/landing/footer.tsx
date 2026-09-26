import Link from "next/link";
import { Logo } from "@/components/logo";

const COLS = [
  { h: "Product", l: [["How it works", "#how"], ["Tracking", "#tracking"], ["Pricing", "#pricing"], ["Dashboard", "/login"]] },
  { h: "Developers", l: [["API reference", "#api"], ["Response fields", "#api"], ["Webhooks", "#api"]] },
  { h: "Company", l: [["Insyd", "https://insyd.in"], ["Contact", "mailto:hello@insyd.in"], ["Terms", "#"], ["Privacy", "#"]] },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo />
            <p>Instagram post metrics, tracked every two hours and served through one clean API.</p>
          </div>
          {COLS.map((c) => (
            <div key={c.h} className="footer-col">
              <h4>{c.h}</h4>
              {c.l.map(([label, href]) => (
                <Link key={label} href={href}>{label}</Link>
              ))}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Insyd. All rights reserved.</span>
          <span>Not affiliated with Instagram or Meta.</span>
        </div>
      </div>
      <div className="footer-word" aria-hidden>vouch</div>
    </footer>
  );
}
