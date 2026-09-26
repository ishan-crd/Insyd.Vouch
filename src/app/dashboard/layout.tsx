import type { Metadata } from "next";
import { Sidebar } from "@/components/app/sidebar";
import { requireUser } from "@/lib/auth";
import { usd } from "@/lib/pricing";
import { admin } from "@/lib/supabase/admin";
import { monthStart, usageSince } from "@/lib/usage";

export const metadata: Metadata = { title: "Console — Vouch" };

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const user = await requireUser();
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
