"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { Heart, MessageCircle, Play, Repeat2 } from "lucide-react";
import { useRef, useState } from "react";

// Views of one reel, sampled every two hours for 48 hours.
const VIEWS = [0, 8_400, 31_200, 74_900, 141_000, 228_500, 322_000, 418_700, 506_300, 590_100, 661_800, 724_400, 781_000,
  829_600, 872_300, 910_900, 944_000, 973_200, 998_500, 1_020_400, 1_039_800, 1_056_900, 1_071_300, 1_083_900, 1_094_600];

const W = 560, H = 240, PAD = 8;
const MAX = VIEWS[VIEWS.length - 1];
const pt = (v: number, i: number) => [PAD + (i / (VIEWS.length - 1)) * (W - PAD * 2), H - PAD - (v / MAX) * (H - PAD * 2 - 20)] as const;
const LINE = VIEWS.map((v, i) => `${i ? "L" : "M"}${pt(v, i).join(",")}`).join(" ");
const AREA = `${LINE} L${W - PAD},${H} L${PAD},${H} Z`;

const STEPS = [
  { t: "Snapshot one, the moment you add it", d: "The first pull captures every field: views, plays, likes, comments, caption, audio, owner and more." },
  { t: "Then every two hours, automatically", d: "Our scheduler re-runs the post on a fixed cadence. No cron jobs on your side, no missed windows." },
  { t: "A growth curve you can act on", d: "Spot the reels that are still climbing, pay creators on verified numbers, and prove campaign reach." },
];

const fmt = (n: number) => n.toLocaleString("en-US");

export function Tracking() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 60%", "end 80%"] });
  const draw = useTransform(scrollYProgress, [0.05, 0.9], [0, 1]);
  const clipW = useTransform(draw, (v) => v * W + 2);
  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const d = Math.min(1, Math.max(0, (p - 0.05) / 0.85));
    setIdx(Math.round(d * (VIEWS.length - 1)));
    setStep(p < 0.33 ? 0 : p < 0.66 ? 1 : 2);
  });

  const views = VIEWS[idx];
  const [dx, dy] = pt(views, idx);
  const hours = idx * 2;
  const log = Array.from({ length: Math.min(idx + 1, 4) }, (_, k) => idx - k);

  return (
    <section id="tracking" className="section track" ref={ref}>
      <div className="wrap track-grid">
        <div className="track-copy">
          <div className="section-head" style={{ marginBottom: 40 }}>
            <span className="eyebrow">Tracking</span>
            <h2 className="h2">
              Not a number. <span className="serif blue">A timeline.</span>
            </h2>
          </div>
          <ol className="track-steps">
            {STEPS.map((s, i) => (
              <li key={s.t} className={i === step ? "on" : ""}>
                <span className="track-idx">0{i + 1}</span>
                <div>
                  <h3 className="h3">{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="track-stage">
          <div className="card track-card">
            <div className="track-post">
              <i><Play size={14} fill="#fff" stroke="none" /></i>
              <div>
                <b>@nomad.eats</b>
                <small>instagram.com/reel/C8xQ2Lm…</small>
              </div>
              <span className="track-live"><span className="live-dot" /> Tracking</span>
            </div>

            <div className="track-kpis">
              <div>
                <small>Views</small>
                <b className="num">{fmt(views)}</b>
              </div>
              <div>
                <small><Heart size={12} /> Likes</small>
                <b className="num">{fmt(Math.round(views * 0.072))}</b>
              </div>
              <div>
                <small><MessageCircle size={12} /> Comments</small>
                <b className="num">{fmt(Math.round(views * 0.0018))}</b>
              </div>
              <div>
                <small><Repeat2 size={12} /> Shares</small>
                <b className="num">{fmt(Math.round(views * 0.0137))}</b>
              </div>
            </div>

            <div className="track-chart">
              <svg viewBox={`0 0 ${W} ${H}`} aria-label="Views over 48 hours">
                <defs>
                  <linearGradient id="trackArea" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#1E54E8" stopOpacity=".2" />
                    <stop offset="1" stopColor="#1E54E8" stopOpacity="0" />
                  </linearGradient>
                  <clipPath id="trackClip">
                    <motion.rect x="0" y="0" height={H} style={{ width: clipW }} />
                  </clipPath>
                </defs>
                {[0.25, 0.5, 0.75].map((f) => (
                  <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="rgba(10,26,51,.07)" strokeDasharray="3 5" />
                ))}
                <path d={AREA} fill="url(#trackArea)" clipPath="url(#trackClip)" />
                <motion.path d={LINE} fill="none" stroke="#1E54E8" strokeWidth="2.4" strokeLinecap="round" style={{ pathLength: draw }} />
                <circle cx={dx} cy={dy} r="9" fill="#1E54E8" opacity=".15" />
                <circle cx={dx} cy={dy} r="4.5" fill="#fff" stroke="#1E54E8" strokeWidth="2.4" />
              </svg>
              <div className="track-axis">
                <span>0h</span><span>12h</span><span>24h</span><span>36h</span><span>48h</span>
              </div>
            </div>

            <div className="track-log">
              {log.map((i) => (
                <div key={i} className="track-log-row">
                  <span className="mono">snapshot #{i + 1}</span>
                  <span className="mono dim">+{i * 2}h</span>
                  <span className="num">{fmt(VIEWS[i])} views</span>
                  <span className="track-ok">200 OK</span>
                </div>
              ))}
            </div>
            <div className="track-foot mono">
              {hours}h tracked · next check in 2h
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
