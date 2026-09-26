"use client";

import { Play } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import { runScrape } from "@/app/dashboard/actions";
import { parseTarget } from "@/lib/instagram";
import { costFor, usd } from "@/lib/pricing";

export function ScrapeForm({ initialUrls = "" }: { initialUrls?: string }) {
  const [state, action, pending] = useActionState(runScrape, undefined);
  const [urls, setUrls] = useState(initialUrls);
  const [limit, setLimit] = useState(25);
  const [newer, setNewer] = useState("");
  const [shares, setShares] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [trial, setTrial] = useState(false);
  const [track, setTrack] = useState(false);
  const [days, setDays] = useState(7);

  const parsed = useMemo(
    () =>
      urls
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((raw) => ({ raw, t: parseTarget(raw) })),
    [urls],
  );
  const posts = parsed.filter((p) => p.t?.kind === "post").length;
  const profiles = parsed.filter((p) => p.t?.kind === "profile").length;
  const invalid = parsed.filter((p) => !p.t).length;
  const maxResults = posts + profiles * limit;
  const trackedResults = track ? posts * 12 * days : 0;

  const body = {
    urls: parsed.flatMap((p) => (p.t ? [p.t.url] : [])),
    ...(profiles ? { resultsLimit: limit } : {}),
    ...(newer ? { onlyPostsNewerThan: newer } : {}),
    ...(pinned ? { skipPinnedPosts: true } : {}),
    ...(trial ? { skipTrialReels: true } : {}),
    ...(shares ? { includeSharesCount: true } : {}),
    ...(track ? { track: true, trackForDays: days } : {}),
  };

  return (
    <form action={action} className="scrape">
      <div className="scrape-main">
        <section className="panel">
          <div className="panel-head">
            <h2>Instagram URLs or usernames</h2>
            <span className="muted-sm">One per line · up to 500</span>
          </div>
          <div className="panel-body">
            <label className="field">
              <textarea
                name="urls"
                rows={7}
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                placeholder={"https://www.instagram.com/reel/C8xQ2Lm/\nhttps://www.instagram.com/p/DYQWK2abc/\nnatgeo"}
                className="mono-input"
                required
              />
            </label>
            <div className="parse-chips">
              <span className="pchip">
                {posts} post{posts === 1 ? "" : "s"}
              </span>
              <span className="pchip">
                {profiles} profile{profiles === 1 ? "" : "s"}
              </span>
              {invalid > 0 && <span className="pchip bad">{invalid} not recognised</span>}
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Profiles</h2>
            <span className="muted-sm">Only applies to usernames and profile URLs</span>
          </div>
          <div className="panel-body grid-2">
            <label className="field">
              <span>Max reels per profile</span>
              <input
                name="resultsLimit"
                type="number"
                min={1}
                max={1000}
                value={limit}
                onChange={(e) => setLimit(Math.max(1, Number(e.target.value) || 1))}
              />
            </label>
            <label className="field">
              <span>
                Only reels newer than <em>optional</em>
              </span>
              <input
                name="onlyPostsNewerThan"
                value={newer}
                onChange={(e) => setNewer(e.target.value)}
                placeholder="2026-09-01 or 7 days"
              />
            </label>
            <Toggle
              name="skipPinnedPosts"
              checked={pinned}
              onChange={setPinned}
              label="Skip pinned reels"
              hint="Pinned reels are often much older than the rest."
            />
            <Toggle
              name="skipTrialReels"
              checked={trial}
              onChange={setTrial}
              label="Skip trial reels"
              hint="Reels creators test with non-followers first."
            />
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Add-ons & tracking</h2>
          </div>
          <div className="panel-body grid-2">
            <Toggle
              name="includeSharesCount"
              checked={shares}
              onChange={setShares}
              label="Include shares count"
              hint="Adds sharesCount to every result. +$10 per 1,000 results."
            />
            <Toggle
              name="track"
              checked={track}
              onChange={setTrack}
              label="Track these posts every 2 hours"
              hint="Post and reel links only. Each check is billed as one result."
            />
            {track && (
              <label className="field">
                <span>Track for</span>
                <select name="trackForDays" value={days} onChange={(e) => setDays(Number(e.target.value))}>
                  {[1, 3, 7, 14, 30, 90].map((d) => (
                    <option key={d} value={d}>
                      {d} {d === 1 ? "day" : "days"}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </section>
      </div>

      <aside className="scrape-side">
        <div className="panel sticky">
          <div className="panel-body">
            <div className="est-row">
              <span>Results now</span>
              <b>{profiles ? `up to ${maxResults.toLocaleString()}` : maxResults.toLocaleString()}</b>
            </div>
            {track && (
              <div className="est-row">
                <span>Tracking checks</span>
                <b>{trackedResults.toLocaleString()}</b>
              </div>
            )}
            <div className="est-row">
              <span>Rate</span>
              <b>{usd(shares ? 14 : 4)} / 1k</b>
            </div>
            <div className="est-total">
              <span>Estimated cost</span>
              <b>{usd(costFor(maxResults + trackedResults, shares))}</b>
            </div>
            <p className="muted-sm">You&apos;re only billed for results actually returned.</p>
            {state?.error && <p className="auth-error">{state.error}</p>}
            <button type="submit" className="btn btn-primary btn-lg start-btn" disabled={pending || parsed.length === 0}>
              <Play size={16} fill="currentColor" /> {pending ? "Starting…" : "Start"}
            </button>
          </div>
          <div className="api-preview">
            <div className="api-preview-head">Same request via API</div>
            <pre>{`POST /v1/scrape\n${JSON.stringify(body, null, 2)}`}</pre>
          </div>
        </div>
      </aside>
    </form>
  );
}

function Toggle({
  name,
  checked,
  onChange,
  label,
  hint,
}: {
  name: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="toggle">
      <input type="checkbox" name={name} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-ui" aria-hidden />
      <span className="toggle-text">
        <b>{label}</b>
        {hint && <small>{hint}</small>}
      </span>
    </label>
  );
}
