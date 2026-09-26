"use client";

import { Activity, BarChart3, Clock, KeyRound, LayoutGrid, Play, Search, Webhook } from "lucide-react";
import { useEffect, useState } from "react";

type Row = {
  handle: string;
  caption: string;
  kind: "Reel" | "Post";
  views: number;
  likes: number;
  comments: number;
  shares: number;
  next: string;
  hue: number;
  trend: number[];
};

const ROWS: Row[] = [
  { handle: "@glowlab.skin", caption: "3 steps to glass skin ✨", kind: "Reel", views: 1_284_310, likes: 96_402, comments: 1_873, shares: 12_044, next: "1h 12m", hue: 222, trend: [4, 9, 16, 24, 31, 37, 42, 46] },
  { handle: "@runclub.delhi", caption: "Sunday 10K, 400 of us 🏃", kind: "Reel", views: 402_118, likes: 38_990, comments: 624, shares: 3_310, next: "0h 48m", hue: 205, trend: [6, 10, 13, 20, 22, 29, 33, 35] },
  { handle: "@nomad.eats", caption: "₹80 thali that beat a 5-star", kind: "Reel", views: 2_931_775, likes: 211_560, comments: 5_402, shares: 40_118, next: "1h 55m", hue: 212, trend: [3, 12, 22, 30, 38, 43, 45, 47] },
  { handle: "@studio.fold", caption: "New drop. Link in bio.", kind: "Post", views: 88_204, likes: 7_012, comments: 211, shares: 402, next: "0h 21m", hue: 214, trend: [10, 14, 17, 19, 21, 22, 23, 23] },
];

const fmt = (n: number) => n.toLocaleString("en-US");

function Spark({ data, hue }: { data: number[]; hue: number }) {
  const w = 84, h = 26, max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * (h - 3) - 1.5}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <defs>
        <linearGradient id={`g${hue}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#1E54E8" stopOpacity=".22" />
          <stop offset="1" stopColor="#1E54E8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#g${hue})`} />
      <polyline points={pts} fill="none" stroke="#1E54E8" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function DashboardMock() {
  const [rows, setRows] = useState(ROWS);

  // Nudge the numbers upward so the mock reads as live data.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setRows((prev) =>
        prev.map((r) => {
          const bump = Math.round(r.views * 0.00004 * Math.random()) + 1;
          return { ...r, views: r.views + bump * 7, likes: r.likes + bump, comments: r.comments + (Math.random() > 0.7 ? 1 : 0), shares: r.shares + (Math.random() > 0.5 ? 1 : 0) };
        }),
      );
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="window dash">
      <div className="window-bar">
        <i /><i /><i />
        <span className="url">app.vouch.dev/tracked</span>
      </div>
      <div className="dash-body">
        <aside className="dash-side">
          <div className="dash-ws">
            <span className="dash-avatar">A</span>
            <div>
              <b>Acme Social</b>
              <small>Growth plan</small>
            </div>
          </div>
          {[
            [LayoutGrid, "Overview"],
            [Activity, "Tracked posts", true],
            [Play, "Runs"],
            [BarChart3, "Usage"],
            [Webhook, "Webhooks"],
            [KeyRound, "API keys"],
          ].map(([Icon, label, active]) => {
            const I = Icon as typeof LayoutGrid;
            return (
              <div key={label as string} className={`dash-link ${active ? "on" : ""}`}>
                <I size={14} /> {label as string}
              </div>
            );
          })}
          <div className="dash-usage">
            <div><span>Usage</span><span>$18.40</span></div>
            <div className="bar"><span style={{ width: "46%" }} /></div>
          </div>
        </aside>
        <div className="dash-main">
          <div className="dash-head">
            <div>
              <h4>Tracked posts</h4>
              <p><span className="live-dot" /> 4 posts · re-checked every 2 hours</p>
            </div>
            <div className="dash-search"><Search size={13} /> Search by URL or handle</div>
          </div>
          <div className="dash-table">
            <div className="dash-tr dash-th">
              <span>Post</span><span>Views</span><span>Likes</span><span className="hide-sm">Comments</span><span className="hide-sm">Shares</span><span className="hide-md">48h trend</span><span className="hide-md">Next check</span>
            </div>
            {rows.map((r) => (
              <div key={r.handle} className="dash-tr">
                <span className="dash-post">
                  <i style={{ background: `linear-gradient(135deg, hsl(${r.hue} 90% 62%), hsl(${r.hue + 12} 85% 42%))` }}>
                    {r.kind === "Reel" && <Play size={10} fill="#fff" stroke="none" />}
                  </i>
                  <span>
                    <b>{r.handle}</b>
                    <small>{r.caption}</small>
                  </span>
                </span>
                <span className="num">{fmt(r.views)}</span>
                <span className="num">{fmt(r.likes)}</span>
                <span className="num hide-sm">{fmt(r.comments)}</span>
                <span className="num hide-sm">{fmt(r.shares)}</span>
                <span className="hide-md"><Spark data={r.trend} hue={r.hue} /></span>
                <span className="hide-md dash-next"><Clock size={12} /> {r.next}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
