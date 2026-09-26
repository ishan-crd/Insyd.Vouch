"use client";

import { ExternalLink, Play } from "lucide-react";
import { useMemo, useState } from "react";
import { img } from "@/lib/format";

type Item = Record<string, unknown>;

const OVERVIEW: { key: string; label: string; sub: string }[] = [
  { key: "displayUrl", label: "Post", sub: "displayUrl" },
  { key: "caption", label: "Text", sub: "caption" },
  { key: "ownerFullName", label: "Author", sub: "ownerFullName" },
  { key: "ownerUsername", label: "Username", sub: "ownerUsername" },
  { key: "videoViewCount", label: "Views", sub: "videoViewCount" },
  { key: "videoPlayCount", label: "Plays", sub: "videoPlayCount" },
  { key: "likesCount", label: "Likes", sub: "likesCount" },
  { key: "commentsCount", label: "Comments", sub: "commentsCount" },
  { key: "sharesCount", label: "Shares", sub: "sharesCount" },
  { key: "timestamp", label: "Posted", sub: "timestamp" },
  { key: "url", label: "Post URL", sub: "url" },
];

function coverage(items: Item[], key: string) {
  if (!items.length) return 0;
  const n = items.filter((i) => i[key] !== undefined && i[key] !== null && i[key] !== "").length;
  return Math.round((n / items.length) * 100);
}

function Cell({ k, v }: { k: string; v: unknown }) {
  if (v === undefined || v === null || v === "") return <span className="dim">undefined</span>;
  if (k === "displayUrl") {
    const src = img(v);
    return src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" className="thumb" loading="lazy" />
    ) : null;
  }
  if (k === "url" || k === "inputUrl" || k === "videoUrl") {
    return (
      <a href={String(v)} target="_blank" rel="noreferrer" className="blue link-cell">
        {String(v).replace(/^https?:\/\/(www\.)?/, "")} <ExternalLink size={11} />
      </a>
    );
  }
  if (typeof v === "number") return <span className="num">{v.toLocaleString("en-US")}</span>;
  if (typeof v === "boolean") return <span className="mono-sm">{String(v)}</span>;
  if (typeof v === "object") return <code className="json-cell">{JSON.stringify(v).slice(0, 160)}</code>;
  if (k === "timestamp") return <span className="nowrap">{String(v).replace("T", " ").slice(0, 19)}</span>;
  return <span className="text-cell">{String(v)}</span>;
}

export function OutputView({ items, total, exportBase }: { items: Item[]; total: number; exportBase: string }) {
  const [mode, setMode] = useState<"overview" | "all">("overview");
  const [view, setView] = useState<"table" | "json">("table");

  const columns = useMemo(() => {
    if (mode === "overview") return OVERVIEW.filter((c) => c.key !== "sharesCount" || items.some((i) => i.sharesCount !== undefined));
    const keys: string[] = [];
    const seen = new Set<string>();
    for (const i of items) for (const k of Object.keys(i)) {
      if (seen.has(k)) continue;
      seen.add(k);
      keys.push(k);
    }
    return keys.map((k) => ({ key: k, label: k, sub: "" }));
  }, [mode, items]);

  return (
    <div className="output">
      <div className="output-bar">
        <div className="seg">
          <button type="button" className={mode === "overview" ? "on" : ""} onClick={() => setMode("overview")}>Overview</button>
          <button type="button" className={mode === "all" ? "on" : ""} onClick={() => setMode("all")}>All fields</button>
        </div>
        <div className="output-actions">
          <div className="seg">
            <button type="button" className={view === "table" ? "on" : ""} onClick={() => setView("table")}>Table</button>
            <button type="button" className={view === "json" ? "on" : ""} onClick={() => setView("json")}>JSON</button>
          </div>
          <a className="btn btn-ghost btn-sm" href={`${exportBase}?format=csv`}>Export CSV</a>
          <a className="btn btn-primary btn-sm" href={`${exportBase}?format=json`}>Export JSON</a>
        </div>
      </div>

      {total > items.length && (
        <p className="muted-sm output-note">Showing the first {items.length.toLocaleString()} of {total.toLocaleString()} results. Export to get all of them.</p>
      )}

      {view === "json" ? (
        <pre className="json-view" data-lenis-prevent>{JSON.stringify(items, null, 2)}</pre>
      ) : (
        <div className="table-card output-table" data-lenis-prevent>
          <table className="table">
            <thead>
              <tr>
                <th className="idx">#</th>
                {columns.map((c) => (
                  <th key={c.key}>
                    <div className="th-stack">
                      <span>
                        {c.label} <em className="cov">{coverage(items, c.key)}%</em>
                      </span>
                      {c.sub && <small>{c.sub}</small>}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td className="idx">{i + 1}</td>
                  {columns.map((c) => (
                    <td key={c.key} className={c.key === "caption" ? "caption-cell" : undefined}>
                      <Cell k={c.key} v={item[c.key]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function RunningOutput() {
  return (
    <div className="running">
      <div className="running-icon"><Play size={18} fill="currentColor" /></div>
      <h3>Scraping in progress</h3>
      <p>Results appear here as soon as the run finishes. This page refreshes on its own.</p>
      <div className="running-bar"><span /></div>
    </div>
  );
}
