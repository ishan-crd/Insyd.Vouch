import { BarChart } from "@/components/app/charts";
import { Kpi, PageHead } from "@/components/app/ui";
import { requireUser } from "@/lib/auth";
import { PRICE_PER_1K_RESULTS, SHARES_ADDON_PER_1K, usd } from "@/lib/pricing";
import { monthStart, usageSince } from "@/lib/usage";

export default async function UsagePage() {
  const user = await requireUser();
  const now = new Date();
  const start30 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 29));
  const [month, last30] = await Promise.all([usageSince(user.id, monthStart()), usageSince(user.id, start30)]);

  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(start30.getTime() + i * 86_400_000);
    return { key: d.toISOString().slice(0, 10), label: d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }), cost: 0, results: 0 };
  });
  const byDay = new Map(days.map((d) => [d.key, d]));
  for (const r of last30.rows) {
    const d = byDay.get(r.started_at.slice(0, 10));
    if (!d) continue;
    d.cost += Number(r.cost_usd);
    d.results += r.result_count;
  }

  const monthName = now.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <>
      <PageHead title="Usage & billing" sub={`Metered per result. Figures for ${monthName} (UTC).`} />
      <div className="kpis kpis-4">
        <Kpi label="Spend this month" value={usd(month.costUsd)} />
        <Kpi label="Results" value={month.results.toLocaleString()} />
        <Kpi label="Runs" value={month.runs.toLocaleString()} />
        <Kpi label="Avg cost / result" value={month.results ? usd(month.costUsd / month.results, 4) : "—"} />
      </div>

      <section className="panel">
        <div className="panel-head"><h2>Daily spend</h2><span className="muted-sm">Last 30 days</span></div>
        <div className="panel-body">
          <BarChart label="Spend" bars={days.map((d) => ({ label: d.label, v: Math.round(d.cost * 100) / 100 }))} unit="usd" />
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><h2>Daily results</h2><span className="muted-sm">Last 30 days</span></div>
        <div className="panel-body">
          <BarChart label="Results" bars={days.map((d) => ({ label: d.label, v: d.results }))} />
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><h2>Rates</h2></div>
        <div className="panel-body rates">
          <div><span>Results (any post, reel or profile item)</span><b>{usd(PRICE_PER_1K_RESULTS)} / 1,000</b></div>
          <div><span>Shares count add-on</span><b>+{usd(SHARES_ADDON_PER_1K)} / 1,000</b></div>
          <div><span>Tracking check (every 2 hours)</span><b>1 result each</b></div>
          <div><span>Failed runs or empty results</span><b>Free</b></div>
        </div>
      </section>
    </>
  );
}
