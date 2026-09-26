"use client";

import { useId, useMemo, useRef, useState } from "react";

const BLUE = "#1E54E8";
const W = 720;

function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  const step = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((x) => n <= x) ?? 10;
  return step * p;
}

const short = (n: number) => Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);

type Point = { t: string; v: number | null };

/** Single-series line/area over time with a crosshair tooltip. */
export function LineChart({
  points,
  label,
  height = 260,
  fmtTime,
}: {
  points: Point[];
  label: string;
  height?: number;
  fmtTime?: (t: string) => string;
}) {
  const id = useId();
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const H = height,
    L = 48,
    R = 12,
    T = 12,
    B = 28;

  const { xs, ys, max, path, area, ticks } = useMemo(() => {
    const vals = points.map((p) => p.v ?? 0);
    const max = niceMax(Math.max(...vals, 0));
    const t0 = points.length ? Date.parse(points[0].t) : 0;
    const t1 = points.length ? Date.parse(points[points.length - 1].t) : 1;
    const span = Math.max(1, t1 - t0);
    const xs = points.map((p) => (points.length === 1 ? (L + W - R) / 2 : L + ((Date.parse(p.t) - t0) / span) * (W - L - R)));
    const ys = vals.map((v) => T + (1 - v / max) * (H - T - B));
    const path = xs.map((x, i) => `${i ? "L" : "M"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
    const area = xs.length ? `${path} L${xs[xs.length - 1].toFixed(1)},${H - B} L${xs[0].toFixed(1)},${H - B} Z` : "";
    return { xs, ys, max, path, area, ticks: [0, 0.25, 0.5, 0.75, 1].map((f) => f * max) };
  }, [points, H]);

  const fmtT =
    fmtTime ?? ((t: string) => new Date(t).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }));

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!ref.current) return;
    const box = ref.current.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * W;
    let best = 0;
    for (let i = 1; i < xs.length; i++) if (Math.abs(xs[i] - x) < Math.abs(xs[best] - x)) best = i;
    setHover(xs.length ? best : null);
  }

  if (!points.length) return <div className="chart-empty">No data yet. The first snapshot appears after the initial check completes.</div>;

  const hp = hover !== null ? points[hover] : null;
  return (
    <div className="chart">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="chart-svg"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`${label} over time`}
      >
        <defs>
          <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={BLUE} stopOpacity=".16" />
            <stop offset="1" stopColor={BLUE} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((v) => {
          const y = T + (1 - v / max) * (H - T - B);
          return (
            <g key={v}>
              <line x1={L} x2={W - R} y1={y} y2={y} stroke="rgba(10,26,51,.07)" />
              <text x={L - 8} y={y + 4} textAnchor="end" className="chart-axis">
                {short(v)}
              </text>
            </g>
          );
        })}
        {[0, Math.floor((points.length - 1) / 2), points.length - 1]
          .filter((v, i, a) => a.indexOf(v) === i)
          .map((i) => (
            <text
              key={i}
              x={xs[i]}
              y={H - 8}
              textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}
              className="chart-axis"
            >
              {fmtT(points[i].t)}
            </text>
          ))}
        <path d={area} fill={`url(#${id})`} />
        <path d={path} fill="none" stroke={BLUE} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.length <= 40 && points.map((p, i) => <circle key={p.t} cx={xs[i]} cy={ys[i]} r="2.5" fill={BLUE} />)}
        {hover !== null && (
          <g>
            <line x1={xs[hover]} x2={xs[hover]} y1={T} y2={H - B} stroke="rgba(10,26,51,.25)" strokeDasharray="3 3" />
            <circle cx={xs[hover]} cy={ys[hover]} r="5" fill="#fff" stroke={BLUE} strokeWidth="2" />
          </g>
        )}
      </svg>
      {hp && hover !== null && (
        <div className="chart-tip" style={{ left: `${(xs[hover] / W) * 100}%` }}>
          <small>{fmtT(hp.t)}</small>
          <b>{hp.v === null ? "—" : hp.v.toLocaleString("en-US")}</b>
          <span>{label}</span>
        </div>
      )}
    </div>
  );
}

/** Single-series vertical bars with a per-bar tooltip. */
export function BarChart({
  bars,
  label,
  height = 220,
  unit = "count",
}: {
  bars: { label: string; v: number }[];
  label: string;
  height?: number;
  unit?: "count" | "usd";
}) {
  const format = (v: number) =>
    unit === "usd"
      ? v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: v && v < 1 ? 3 : 2 })
      : v.toLocaleString("en-US");
  const [hover, setHover] = useState<number | null>(null);
  const H = height,
    L = 44,
    R = 8,
    T = 12,
    B = 26;
  const max = niceMax(Math.max(...bars.map((b) => b.v), 0));
  const slot = (W - L - R) / Math.max(1, bars.length);
  const bw = Math.max(2, slot - 2); // 2px surface gap between bars
  const y = (v: number) => T + (1 - v / max) * (H - T - B);

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" role="img" aria-label={label} onPointerLeave={() => setHover(null)}>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={L} x2={W - R} y1={y(f * max)} y2={y(f * max)} stroke="rgba(10,26,51,.07)" />
            <text x={L - 8} y={y(f * max) + 4} textAnchor="end" className="chart-axis">
              {format(f * max)}
            </text>
          </g>
        ))}
        {bars.map((b, i) => {
          const x = L + i * slot + 1;
          const top = y(b.v);
          const h = H - B - top;
          const r = Math.min(4, bw / 2, h);
          // Rounded top, square base anchored to the axis.
          const d =
            h > 0
              ? `M${x},${H - B} V${top + r} Q${x},${top} ${x + r},${top} H${x + bw - r} Q${x + bw},${top} ${x + bw},${top + r} V${H - B} Z`
              : "";
          return (
            <g key={b.label} onPointerEnter={() => setHover(i)}>
              <rect x={L + i * slot} y={T} width={slot} height={H - T - B} fill="transparent" />
              {d && <path d={d} fill={hover === i ? "#153fb5" : "#1E54E8"} opacity={hover === null || hover === i ? 1 : 0.55} />}
            </g>
          );
        })}
        {bars.length > 0 &&
          [0, bars.length - 1].map((i) => (
            <text key={i} x={L + i * slot + slot / 2} y={H - 8} textAnchor={i === 0 ? "start" : "end"} className="chart-axis">
              {bars[i].label}
            </text>
          ))}
      </svg>
      {hover !== null && bars[hover] && (
        <div className="chart-tip" style={{ left: `${((L + hover * slot + slot / 2) / W) * 100}%` }}>
          <small>{bars[hover].label}</small>
          <b>{format(bars[hover].v)}</b>
          <span>{label}</span>
        </div>
      )}
    </div>
  );
}
