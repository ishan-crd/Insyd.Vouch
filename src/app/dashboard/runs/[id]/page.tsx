import { ArrowLeft, Code2, FileInput, ListTree } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AutoRefresh } from "@/components/app/auto-refresh";
import { OutputView, RunningOutput } from "@/components/app/output-view";
import { OriginTag, PageHead, StatusBadge } from "@/components/app/ui";
import { requireUser } from "@/lib/auth";
import { dateTime, duration, secondsSince } from "@/lib/format";
import { usd } from "@/lib/pricing";
import { refreshRun } from "@/lib/scrape";
import { durationSecs } from "@/lib/serialize";
import { admin } from "@/lib/supabase/admin";

const SHOW = 1000;

export default async function RunPage({ params, searchParams }: PageProps<"/dashboard/runs/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const tab = (await searchParams).tab === "input" ? "input" : (await searchParams).tab === "api" ? "api" : "output";
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const db = admin();
  const { data: row } = await db.from("runs").select().eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!row) notFound();
  const run = await refreshRun(row);
  const running = run.status === "RUNNING" || run.status === "READY";

  const { data: items } = running
    ? { data: [] }
    : await db.from("run_items").select("data").eq("run_id", id).order("position").limit(SHOW);

  const base = `/dashboard/runs/${id}`;
  const statusCls = run.status === "SUCCEEDED" ? "ok" : running ? "run" : "bad";

  return (
    <>
      <AutoRefresh active={running} />
      <PageHead
        back={<Link href="/dashboard/runs" className="back" aria-label="Back to runs"><ArrowLeft size={18} /></Link>}
        title={<>Run <span className="mono dim run-id">{run.short_id}</span></>}
        sub={
          <div className="run-meta">
            <span className={`run-status run-status-${statusCls}`}>
              <StatusBadge status={run.status} />
              {run.status_message ?? (running ? "Scraping Instagram…" : "")}
            </span>
            <span><b>{usd(Number(run.cost_usd))}</b></span>
            <span>{dateTime(run.started_at)}</span>
            <span>{duration(durationSecs(run) ?? secondsSince(run.started_at))}</span>
            <OriginTag origin={run.origin} />
          </div>
        }
        actions={
          <Link href={`/dashboard/scrape?url=${encodeURIComponent(((run.input as { username?: string[] }).username ?? []).join("\n"))}`} className="btn btn-ghost">
            Run again
          </Link>
        }
      />

      <nav className="tabs">
        <Link href={base} className={tab === "output" ? "on" : ""}>
          <ListTree size={15} /> Output <span className="count">{run.result_count.toLocaleString()}</span>
        </Link>
        <Link href={`${base}?tab=input`} className={tab === "input" ? "on" : ""}><FileInput size={15} /> Input</Link>
        <Link href={`${base}?tab=api`} className={tab === "api" ? "on" : ""}><Code2 size={15} /> API</Link>
      </nav>

      {tab === "output" &&
        (running ? (
          <RunningOutput />
        ) : (items ?? []).length === 0 ? (
          <div className="running">
            <h3>No results</h3>
            <p>{run.status_message ?? "This run returned nothing."} You were not charged for it.</p>
          </div>
        ) : (
          <OutputView items={(items ?? []).map((r) => r.data as Record<string, unknown>)} total={run.result_count} exportBase={`${base}/export`} />
        ))}

      {tab === "input" && <pre className="json-view">{JSON.stringify(run.input, null, 2)}</pre>}

      {tab === "api" && (
        <div className="api-tab">
          {[
            ["Run status", `curl https://api.vouch.dev/v1/runs/${run.id} \\\n  -H "Authorization: Bearer $VOUCH_KEY"`],
            ["Results as JSON", `curl https://api.vouch.dev/v1/runs/${run.id}/items \\\n  -H "Authorization: Bearer $VOUCH_KEY"`],
            ["Results as CSV", `curl "https://api.vouch.dev/v1/runs/${run.id}/items?format=csv" \\\n  -H "Authorization: Bearer $VOUCH_KEY" -o run.csv`],
          ].map(([t, code]) => (
            <div key={t} className="panel">
              <div className="panel-head"><h2>{t}</h2></div>
              <pre className="code-block">{code}</pre>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
