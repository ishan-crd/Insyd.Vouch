import type { Metadata } from "next";
import { Sidebar } from "@/components/app/sidebar";
import { requireUser } from "@/lib/auth";
import { usd } from "@/lib/pricing";
import { admin } from "@/lib/supabase/admin";
import { monthStart, usageSince } from "@/lib/usage";

export const metadata: Metadata = { title: "Console — Vouch" };

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const user = await requireUser();
  const missing = ["SUPABASE_SECRET_KEY", "APIFY_TOKEN"].filter((k) => !process.env[k]);
  if (missing.includes("SUPABASE_SECRET_KEY")) return <SetupNotice missing={missing} />;
  const [{ data: profile }, usage] = await Promise.all([
    admin().from("profiles").select("full_name, company").eq("id", user.id).maybeSingle(),
    usageSince(user.id, monthStart()),
  ]);
  return (
    <div className="app">
      <Sidebar name={profile?.full_name ?? ""} email={user.email ?? ""} company={profile?.company ?? null} spend={usd(usage.costUsd)} />
      <main className="app-main">{children}</main>
    </div>
  );
}

function SetupNotice({ missing }: { missing: string[] }) {
  return (
    <main className="setup">
      <div className="panel setup-card">
        <div className="panel-body">
          <h1>Almost there</h1>
          <p className="muted-sm">
            You&apos;re signed in. The console needs these server keys in <code>.env.local</code>, then a dev-server restart:
          </p>
          <ul>
            {missing.map((k) => (
              <li key={k}>
                <code>{k}</code>
              </li>
            ))}
          </ul>
          <p className="muted-sm">
            <b>SUPABASE_SECRET_KEY</b>: Supabase dashboard → Project settings → API keys → Secret keys → reveal the <code>sb_secret_…</code>{" "}
            key.
            <br />
            <b>APIFY_TOKEN</b>: console.apify.com → Settings → API &amp; Integrations.
          </p>
        </div>
      </div>
    </main>
  );
}
