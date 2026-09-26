import { ChevronLeft, ChevronRight, Play, Plus, Search } from "lucide-react";
import Link from "next/link";
import { AutoRefresh } from "@/components/app/auto-refresh";
import { Empty, OriginTag, PageHead, StatusBadge } from "@/components/app/ui";
import { requireUser } from "@/lib/auth";
import { dateTime, duration, inputSummary } from "@/lib/format";
import { usd } from "@/lib/pricing";
import { refreshRun } from "@/lib/scrape";
import { durationSecs } from "@/lib/serialize";
import { admin } from "@/lib/supabase/admin";

const PER_PAGE = 20;
const FILTERS = [
  { v: "", label: "All" },
  { v: "RUNNING", label: "Running" },
  { v: "SUCCEEDED", label: "Succeeded" },
  { v: "FAILED", label: "Failed" },
];
const ORIGINS = [
  { v: "", label: "Any origin" },
  { v: "WEB", label: "Web" },
  { v: "API", label: "API" },
  { v: "SCHEDULE", label: "Schedule" },
];

export default async function RunsPage({ searchParams }: PageProps<"/dashboard/runs">) {
  const user = await requireUser();
  const q = await searchParams;
  const page = Math.max(1, Number(q.page) || 1);
  const status = typeof q.status === "string" ? q.status : "";
  const origin = typeof q.origin === "string" ? q.origin : "";
  const search = typeof q.q === "string" ? q.q.trim() : "";

  let query = admin().from("runs").select("*", { count: "exact" }).eq("user_id", user.id);
  if (status) query = query.eq("status", status);
  if (origin) query = query.eq("origin", origin);
  if (search) {
    const s = search.toLowerCase();
    query = /^[0-9a-f]{8}-[0-9a-f-]{27}$/.test(s) ? query.eq("id", s) : query.eq("short_id", s.slice(0, 8));
  }
  const { data, count } = await query.order("started_at", { ascending: false }).range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

  // Nudge anything still running so the list reflects reality without webhooks.
  const runs = await Promise.all((data ?? []).map((r) => (r.status === "RUNNING" || r.status === "READY" ? refreshRun(r) : r)));
  const anyRunning = runs.some((r) => r.status === "RUNNING" || r.status === "READY");
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const href = (p: Record<string, string | number>) => {
    const s = new URLSearchParams({ ...(status && { status }), ...(origin && { origin }), ...(search && { q: search }), ...Object.fromEntries(Object.entries(p).map(([k, v]) => [k, String(v)])) });
    for (const [k, v] of [...s.entries()]) if (!v) s.delete(k);
    return `/dashboard/runs${s.size ? `?${s}` : ""}`;
  };

  return (
    <>
      <AutoRefresh active={anyRunning} />
      <PageHead
        title="Runs"
        sub="Every pull you've made from the console, the API or the tracking schedule."
        actions={<Link href="/dashboard/scrape" className="btn btn-primary"><Plus size={16} /> New scrape</Link>}
      />

      <div className="toolbar">
        <form className="search" action="/dashboard/runs">
          <Search size={15} />
          <input name="q" defaultValue={search} placeholder="Search by run ID" />
          {status && <input type="hidden" name="status" value={status} />}
          {origin && <input type="hidden" name="origin" value={origin} />}
        </form>
        <div className="seg">
          {FILTERS.map((f) => (
            <Link key={f.v} href={href({ status: f.v, page: 1 })} className={status === f.v ? "on" : ""}>{f.label}</Link>
          ))}
        </div>
        <div className="seg">
          {ORIGINS.map((f) => (
            <Link key={f.v} href={href({ origin: f.v, page: 1 })} className={origin === f.v ? "on" : ""}>{f.label}</Link>
          ))}
        </div>
        <span className="toolbar-count">{total.toLocaleString()} {total === 1 ? "run" : "runs"}</span>
      </div>

      {runs.length === 0 ? (
        <Empty
          icon={<Play size={20} />}
          title={search || status || origin ? "No runs match" : "No runs yet"}
          action={<Link href="/dashboard/scrape" className="btn btn-primary">Start your first scrape</Link>}
        >
          {search || status || origin ? "Try clearing the filters." : "Paste a reel link and hit Start. Every run you make shows up here."}
        </Empty>
      ) : (
        <div className="table-card">
          <table className="table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Input</th>
                <th className="r">Results</th>
                <th className="r">Cost</th>
                <th>Started</th>
                <th>Finished</th>
                <th className="r">Duration</th>
                <th>Origin</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id} className="row-link">
                  <td>
                    <Link href={`/dashboard/runs/${r.id}`} className="cell-link">
                      <StatusBadge status={r.status} />
                      <span className="run-msg">{r.status_message ?? (r.status === "RUNNING" ? "Scraping…" : "")}</span>
                    </Link>
                  </td>
                  <td className="mono-sm ellip">{inputSummary(r.input)}</td>
                  <td className="r"><Link href={`/dashboard/runs/${r.id}`} className="blue num">{r.result_count.toLocaleString()}</Link></td>
                  <td className="r num">{usd(Number(r.cost_usd))}</td>
                  <td className="nowrap">{dateTime(r.started_at)}</td>
                  <td className="nowrap">{dateTime(r.finished_at)}</td>
                  <td className="r nowrap">{duration(durationSecs(r))}</td>
                  <td><OriginTag origin={r.origin} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-foot">
            <span>Page {page} of {pages}</span>
            <div className="pager">
              <Link aria-disabled={page <= 1} className={page <= 1 ? "off" : ""} href={href({ page: page - 1 })}><ChevronLeft size={16} /></Link>
              <Link aria-disabled={page >= pages} className={page >= pages ? "off" : ""} href={href({ page: page + 1 })}><ChevronRight size={16} /></Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
