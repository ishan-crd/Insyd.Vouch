import { Link2, RefreshCw, Webhook } from "lucide-react";
import { Reveal } from "@/components/reveal";

const CHECKS = ["00:00", "02:00", "04:00", "06:00", "08:00"];

export function How() {
  return (
    <section id="how" className="section">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="eyebrow">How it works</span>
          <h2 className="h2">
            Three steps. <span className="serif blue">Zero scrapers</span> to babysit.
          </h2>
          <p className="lede">
            You bring the links. We handle proxies, rate limits, retries and schema changes, so the numbers just keep
            showing up.
          </p>
        </Reveal>

        <div className="how-grid">
          <Reveal className="card how-card" delay={0}>
            <div className="how-num">01</div>
            <div className="how-visual">
              <div className="how-input">
                <Link2 size={14} />
                <span>instagram.com/reel/C8xQ2…</span>
                <b>Track</b>
              </div>
              <div className="how-input ghost">
                <Link2 size={14} />
                <span>instagram.com/p/DYQWK2…</span>
              </div>
            </div>
            <h3 className="h3">Paste a post or reel link</h3>
            <p>From the dashboard, or one POST request. Bulk-add hundreds of URLs at once.</p>
          </Reveal>

          <Reveal className="card how-card" delay={0.1}>
            <div className="how-num">02</div>
            <div className="how-visual">
              <div className="how-timeline">
                {CHECKS.map((t, i) => (
                  <div key={t} className={`how-tick ${i === CHECKS.length - 1 ? "now" : ""}`}>
                    <span className="bar" style={{ height: `${18 + i * 14}px` }} />
                    <small>{t}</small>
                  </div>
                ))}
              </div>
            </div>
            <h3 className="h3">
              <RefreshCw size={17} className="inline-icon" /> We re-check every 2 hours
            </h3>
            <p>Each check stores a full snapshot, so you see exactly how a post grew, not just where it ended up.</p>
          </Reveal>

          <Reveal className="card how-card" delay={0.2}>
            <div className="how-num">03</div>
            <div className="how-visual">
              <pre className="how-json">
                <span className="tok-p">{"{"}</span>
                {"\n  "}<span className="tok-k">&quot;videoViewCount&quot;</span>: <span className="tok-n">1284310</span>,
                {"\n  "}<span className="tok-k">&quot;likesCount&quot;</span>: <span className="tok-n">96402</span>,
                {"\n  "}<span className="tok-k">&quot;commentsCount&quot;</span>: <span className="tok-n">1873</span>
                {"\n"}<span className="tok-p">{"}"}</span>
              </pre>
            </div>
            <h3 className="h3">
              <Webhook size={17} className="inline-icon" /> Pull it, or have it pushed
            </h3>
            <p>Query the REST API, export CSV / JSON, or get a webhook the moment a new snapshot lands.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
