"use client";

import { Activity, BarChart3, BookOpen, KeyRound, LayoutGrid, LogOut, Play, Radar, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/logo";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/dashboard/scrape", label: "New scrape", icon: Radar },
  { href: "/dashboard/runs", label: "Runs", icon: Play },
  { href: "/dashboard/tracked", label: "Tracked posts", icon: Activity },
  { href: "/dashboard/usage", label: "Usage & billing", icon: BarChart3 },
  { href: "/dashboard/api-keys", label: "API keys", icon: KeyRound },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ name, email, company, spend }: { name: string; email: string; company: string | null; spend: string }) {
  const path = usePathname();
  const active = (href: string, exact?: boolean) => (exact ? path === href : path.startsWith(href));
  return (
    <aside className="side">
      <Link href="/dashboard" className="side-brand">
        <LogoMark size={26} />
        <span>vouch</span>
        <em className="serif">console</em>
      </Link>

      <div className="side-ws">
        <span className="side-avatar">{(company || name || email).slice(0, 1).toUpperCase()}</span>
        <div>
          <b>{company || name || "Personal"}</b>
          <small>{email}</small>
        </div>
      </div>

      <nav className="side-nav">
        {NAV.map(({ href, label, icon: Icon, exact }) => (
          <Link key={href} href={href} className={active(href, exact) ? "on" : ""}>
            <Icon size={16} /> {label}
          </Link>
        ))}
        <div className="side-sep">Developers</div>
        <Link href="/docs" target="_blank">
          <BookOpen size={16} /> API reference
        </Link>
      </nav>

      <div className="side-foot">
        <div className="side-usage">
          <span>This month</span>
          <b>{spend}</b>
        </div>
        <form action="/auth/signout" method="post">
          <button type="submit" className="side-signout">
            <LogOut size={15} /> Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
