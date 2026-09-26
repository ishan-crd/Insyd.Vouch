import { Check, Download, FileJson, KeyRound, Layers, RotateCw, Webhook } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { CountUp } from "./count-up";

const RUNS = [
  { results: 24, cost: "$0.10", started: "19:26:21", dur: "48 s" },
  { results: 248, cost: "$0.99", started: "17:06:24", dur: "1 m 40 s" },
  { results: 100, cost: "$0.40", started: "15:04:43", dur: "57 s" },
  { results: 25, cost: "$0.10", started: "13:02:32", dur: "25 s" },
];

export function Features() {
  return (
    <section className="section features">
      <div className="wrap">
        <Reveal className="section-head center">
          <span className="eyebrow">Platform</span>
          <h2 className="h2">
            Everything around the data, <span className="serif blue">already built.</span>
          </h2>
          <p className="lede">A console for your team, an API for your code, and a paper trail for every single pull.</p>
        </Reveal>

        <div className="bento">
          <Reveal className="card bento-cell span-4">
            <div className="bento-text">
              <h3 className="h3">Every run, on the record</h3>
              <p>Status, results, cost and duration for every pull. Click any run to inspect the full dataset as a table or raw JSON.</p>
            </div>
            <div className="runs">
              <div className="runs-tr runs-th">
                <span>Status</span><span>Results</span><span>Cost</span><span>Started</span><span>Duration</span>
              </div>
              {RUNS.map((r) => (
                <div className="runs-tr" key={r.started}>
                  <span className="runs-status"><i><Check size={11} strokeWidth={3} /></i> Succeeded</span>
                  <span className="blue num">{r.results}</span>
                  <span className="num">{r.cost}</span>
                  <span className="mono">{r.started}</span>
                  <span>{r.dur}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="card bento-cell span-2" delay={0.08}>
            <div className="bento-icon"><Webhook size={18} /></div>
            <h3 className="h3">Webhooks</h3>
            <p>Get a signed POST the moment a snapshot lands or a run fails.</p>
            <div className="events">
              <div><span className="ev ok">snapshots.created</span><small>2s ago</small></div>
              <div><span className="ev ok">run.succeeded</span><small>2s ago</small></div>
              <div><span className="ev">run.failed</span><small>3h ago</small></div>
            </div>
          </Reveal>

          <Reveal className="card bento-cell span-2">
            <div className="bento-icon"><Layers size={18} /></div>
            <h3 className="h3">Bulk tracking</h3>
            <p>Send up to 500 links in one request. We batch, dedupe and schedule them for you.</p>
          </Reveal>

          <Reveal className="card bento-cell span-2" delay={0.06}>
            <div className="bento-icon"><KeyRound size={18} /></div>
            <h3 className="h3">Named API keys</h3>
            <p>Separate keys per project or client. Revoke any of them in one click.</p>
          </Reveal>

          <Reveal className="card bento-cell span-2" delay={0.12}>
            <div className="bento-icon"><Download size={18} /></div>
            <h3 className="h3">Export anything</h3>
            <p>Any run as CSV or JSON, and every post&apos;s full history over the API, ready for your reports.</p>
            <div className="formats">
              <span><FileJson size={13} /> JSON</span><span>CSV</span>
            </div>
          </Reveal>

          <Reveal className="card bento-cell span-3 bento-blue">
            <div className="bento-icon"><RotateCw size={18} /></div>
            <h3 className="h3">Retries you never see</h3>
            <p>Instagram throttles, proxies hiccup, layouts change. We retry, rotate and patch it on our side. You just get the data.</p>
          </Reveal>

          <Reveal className="card bento-cell span-3" delay={0.08}>
            <h3 className="h3">Same shape, every time</h3>
            <p>One-off pulls, tracking snapshots and exports all use the same field names, so your integration code never forks.</p>
            <pre className="schema"><span className="tok-c">{"// GET /v1/runs/:id/items"}</span>{"\n"}<span className="tok-k">&quot;videoViewCount&quot;</span>: <span className="tok-n">1094600</span></pre>
          </Reveal>
        </div>

        <div className="stats">
          {[
            { to: 30, suffix: "+", label: "fields returned per post" },
            { to: 2, suffix: "h", label: "between automatic checks" },
            { to: 12, suffix: "", label: "snapshots per post, per day" },
            { to: 500, suffix: "", label: "links per bulk request" },
          ].map((s, i) => (
            <Reveal key={s.label} className="stat" delay={i * 0.06}>
              <b><CountUp to={s.to} />{s.suffix}</b>
              <span>{s.label}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
