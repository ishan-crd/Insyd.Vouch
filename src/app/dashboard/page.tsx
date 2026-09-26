import { Activity, ArrowRight, Check, KeyRound, Play, Radar } from "lucide-react";
import Link from "next/link";
import { AutoRefresh } from "@/components/app/auto-refresh";
import { Kpi, OriginTag, PageHead, StatusBadge } from "@/components/app/ui";
import { requireUser } from "@/lib/auth";
import { compact, dateTime, inputSummary } from "@/lib/format";
import { usd } from "@/lib/pricing";
import { admin } from "@/lib/supabase/admin";
import { monthStart, usageSince } from "@/lib/usage";

export default async function Overview() {
  const user = await requireUser();
  const db = admin();
  const [{ data: profile }, usage, { data: runs }, { count: tracked }, { count: keys }, { data: top }] = await Promise.all([
    db.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    usageSince(user.id, monthStart()),
    db.from("runs").select().eq("user_id", user.id).order("started_at", { ascending: false }).limit(6),
    db.from("tracked_posts").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "active"),
    db.from("api_keys").select("id", { count: "exact", head: true }).eq("user_id", user.id).is("revoked_at", null),
    db
      .from("tracked_posts")
      .select("id, owner_username, short_code, caption, views, likes")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("views", { ascending: false, nullsFirst: false })
      .limit(5),
  ]);

  const first = profile?.full_name?.split(" ")[0];
  const steps = [
    { done: (runs?.length ?? 0) > 0, label: "Run your first scrape", href: "/dashboard/scrape", icon: Radar },
    { done: (tracked ?? 0) > 0, label: "Track a post every 2 hours", href: "/dashboard/tracked", icon: Activity },
    { done: (keys ?? 0) > 0, label: "Create an API key", href: "/dashboard/api-keys", icon: KeyRound },
  ];
  const running = (runs ?? []).some((r) => r.status === "RUNNING" || r.status === "READY");

  return (
    <>
      <AutoRefresh active={running} every={5000} />
      <PageHead
        title={
          <>
            Good to see you
            {first ? (
              <>
                , <span className="serif blue">{first}</span>
              </>
            ) : null}
            .
          </>
        }
        sub="Here's what Vouch has been pulling for you."
        actions={
          <Link href="/dashboard/scrape" className="btn btn-primary">
            <Play size={15} fill="currentColor" /> New scrape
          </Link>
        }
      />

      {steps.some((s) => !s.done) && (
        <section className="onboard">
          {steps.map((s, i) => (
            <Link key={s.label} href={s.href} className={`onboard-step ${s.done ? "done" : ""}`}>
              <span className="onboard-n">{s.done ? <Check size={14} strokeWidth={3} /> : i + 1}</span>
              <span>{s.label}</span>
              <ArrowRight size={15} className="onboard-arrow" />
            </Link>
          ))}
        </section>
      )}

      <div className="kpis kpis-4">
        <Kpi
          label="Spend this month"
          value={usd(usage.costUsd)}
          hint={
            <Link href="/dashboard/usage" className="blue">
              View usage →
            </Link>
          }
        />
        <Kpi label="Results this month" value={usage.results.toLocaleString()} />
        <Kpi label="Runs this month" value={usage.runs.toLocaleString()} />
        <Kpi label="Posts tracking" value={(tracked ?? 0).toLocaleString()} hint="re-checked every 2h" />
      </div>

      <div className="ov-grid">
        <section className="panel">
          <div className="panel-head">
            <h2>Recent runs</h2>
            <Link href="/dashboard/runs" className="blue muted-link">
              All runs →
            </Link>
          </div>
          {runs?.length ? (
            <table className="table">
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id} className="row-link">
                    <td>
                      <Link href={`/dashboard/runs/${r.id}`} className="cell-link">
                        <StatusBadge status={r.status} />
                      </Link>
                    </td>
                    <td className="mono-sm ellip">{inputSummary(r.input)}</td>
                    <td className="r num">{r.result_count}</td>
                    <td className="r num">{usd(Number(r.cost_usd))}</td>
                    <td className="nowrap muted-sm">{dateTime(r.started_at)}</td>
                    <td>
                      <OriginTag origin={r.origin} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="panel-empty">
              No runs yet.{" "}
              <Link href="/dashboard/scrape" className="blue">
                Start one →
              </Link>
            </p>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Top tracked posts</h2>
            <Link href="/dashboard/tracked" className="blue muted-link">
              All →
            </Link>
          </div>
          {top?.length ? (
            <ul className="toplist">
              {top.map((p, i) => (
                <li key={p.id}>
                  <Link href={`/dashboard/tracked/${p.id}`}>
                    <span className="toplist-n">{i + 1}</span>
                    <span className="toplist-text">
                      <b>{p.owner_username ? `@${p.owner_username}` : p.short_code}</b>
                      <small>{p.caption ?? "Waiting for first check…"}</small>
                    </span>
                    <span className="toplist-v">
                      <b>{compact(p.views)}</b>
                      <small>views</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="panel-empty">
              Track a post to watch it grow.{" "}
              <Link href="/dashboard/tracked" className="blue">
                Track one →
              </Link>
            </p>
          )}
        </section>
      </div>
    </>
  );
}
