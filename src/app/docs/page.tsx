import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "API reference — Vouch",
  description: "Scrape Instagram posts, reels and profiles, and track their metrics every two hours, over one REST API.",
};

const BASE = "https://api.vouch.dev";

type Param = [name: string, type: string, desc: string];
type Endpoint = { id: string; method: "GET" | "POST" | "DELETE"; path: string; title: string; desc: string; params?: Param[]; query?: Param[]; req: string; res: string };

const ENDPOINTS: Endpoint[] = [
  {
    id: "scrape",
    method: "POST",
    path: "/v1/scrape",
    title: "Scrape posts, reels or profiles",
    desc: "Starts a run. Returns 202 with the run straight away, or add ?wait=60 to block up to that many seconds (max 240) and get the items inline with a 201.",
    params: [
      ["urls", "string[]", "Post URLs, reel URLs, profile URLs or usernames. Up to 500. `username` is accepted as an alias."],
      ["resultsLimit", "integer", "Max reels per profile (default 25). Ignored for direct post/reel URLs."],
      ["onlyPostsNewerThan", "string", "YYYY-MM-DD, an ISO timestamp, or relative like `7 days`."],
      ["skipPinnedPosts", "boolean", "Leave pinned reels out of profile results."],
      ["skipTrialReels", "boolean", "Leave trial reels out of profile results."],
      ["includeSharesCount", "boolean", "Adds `sharesCount` to each item. Billed +$10 / 1,000 results."],
      ["track", "boolean", "Also track every post/reel URL in this request every 2 hours."],
      ["trackForDays", "integer", "Stop tracking after this many days (1–365). Omit to track until you stop it."],
    ],
    query: [["wait", "integer", "Seconds to wait for the run to finish (0–240)."]],
    req: `curl -X POST "${BASE}/v1/scrape?wait=60" \\
  -H "Authorization: Bearer $VOUCH_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "urls": ["https://www.instagram.com/reel/C8xQ2Lm/"] }'`,
    res: `{
  "run": {
    "id": "5c1f0b8e-2d4a-4f7e-9a51-0c3e7d2b9f10",
    "status": "SUCCEEDED",
    "statusMessage": "Succeeded with 1 result",
    "origin": "API",
    "input": { "username": ["https://www.instagram.com/reel/C8xQ2Lm/"], "resultsLimit": 25 },
    "resultCount": 1,
    "costUsd": 0.004,
    "startedAt": "2026-09-27T10:02:11.000Z",
    "finishedAt": "2026-09-27T10:02:39.000Z",
    "durationSecs": 28
  },
  "items": [{ "shortCode": "C8xQ2Lm", "videoViewCount": 1094600, "likesCount": 78811, "...": "…" }]
}`,
  },
  {
    id: "runs",
    method: "GET",
    path: "/v1/runs",
    title: "List runs",
    desc: "Every run on your account, newest first, including ones started from the console and by the tracking schedule.",
    query: [
      ["limit", "integer", "1–100, default 20."],
      ["offset", "integer", "For pagination."],
      ["status", "string", "READY, RUNNING, SUCCEEDED, FAILED, ABORTED or TIMED-OUT."],
    ],
    req: `curl "${BASE}/v1/runs?limit=20" -H "Authorization: Bearer $VOUCH_KEY"`,
    res: `{ "total": 42, "limit": 20, "offset": 0, "runs": [ { "id": "…", "status": "SUCCEEDED", "resultCount": 24, "costUsd": 0.096, "…": "…" } ] }`,
  },
  {
    id: "run",
    method: "GET",
    path: "/v1/runs/:id",
    title: "Get a run",
    desc: "Poll this until status is terminal if you didn't use ?wait.",
    req: `curl ${BASE}/v1/runs/$RUN_ID -H "Authorization: Bearer $VOUCH_KEY"`,
    res: `{ "run": { "id": "…", "status": "RUNNING", "resultCount": 0, "…": "…" } }`,
  },
  {
    id: "items",
    method: "GET",
    path: "/v1/runs/:id/items",
    title: "Get a run's results",
    desc: "A JSON array of post objects, exactly as scraped (see Response fields). Use format=csv for a spreadsheet.",
    query: [
      ["format", "string", "json (default) or csv."],
      ["limit", "integer", "1–5000, default 1000."],
      ["offset", "integer", "For pagination."],
    ],
    req: `curl "${BASE}/v1/runs/$RUN_ID/items?format=csv" -H "Authorization: Bearer $VOUCH_KEY" -o results.csv`,
    res: `[ { "inputUrl": "…", "shortCode": "C8xQ2Lm", "videoViewCount": 1094600, "…": "…" } ]`,
  },
  {
    id: "track",
    method: "POST",
    path: "/v1/track",
    title: "Track posts",
    desc: "Fetches each post now, then again every 2 hours. Each check is one result. Only post and reel URLs can be tracked.",
    params: [
      ["urls", "string[]", "Post or reel URLs."],
      ["trackForDays", "integer", "Optional end, 1–365 days."],
      ["includeSharesCount", "boolean", "Record shares on every check (+$10 / 1,000)."],
    ],
    req: `curl -X POST ${BASE}/v1/track \\
  -H "Authorization: Bearer $VOUCH_KEY" -H "Content-Type: application/json" \\
  -d '{ "urls": ["https://www.instagram.com/reel/C8xQ2Lm/"], "trackForDays": 14 }'`,
    res: `{ "run": { "id": "…", "status": "RUNNING" }, "tracked": [ { "id": "…", "shortCode": "C8xQ2Lm", "status": "active", "nextCheckAt": "…" } ] }`,
  },
  {
    id: "track-list",
    method: "GET",
    path: "/v1/track",
    title: "List tracked posts",
    desc: "Latest numbers for everything you track.",
    query: [["status", "string", "active or ended."]],
    req: `curl "${BASE}/v1/track?status=active" -H "Authorization: Bearer $VOUCH_KEY"`,
    res: `{ "tracked": [ { "id": "…", "shortCode": "C8xQ2Lm", "latest": { "views": 1094600, "likes": 78811, "comments": 1970, "shares": null }, "snapshotCount": 25, "…": "…" } ] }`,
  },
  {
    id: "snapshots",
    method: "GET",
    path: "/v1/track/:id/snapshots",
    title: "Get a post's history",
    desc: "Every snapshot, oldest first. `:id` can be the tracking id or the post's shortCode. Add full=true to include the complete post object for each snapshot.",
    query: [["full", "boolean", "Include every field per snapshot."]],
    req: `curl ${BASE}/v1/track/C8xQ2Lm/snapshots -H "Authorization: Bearer $VOUCH_KEY"`,
    res: `{ "snapshots": [ { "takenAt": "2026-09-27T10:02:39Z", "views": 1020400, "likes": 73512, "comments": 1841, "shares": null, "runId": "…" } ] }`,
  },
  {
    id: "untrack",
    method: "DELETE",
    path: "/v1/track/:id",
    title: "Stop tracking",
    desc: "No more checks are scheduled. History is kept.",
    req: `curl -X DELETE ${BASE}/v1/track/C8xQ2Lm -H "Authorization: Bearer $VOUCH_KEY"`,
    res: `{ "tracked": { "id": "…", "status": "ended" } }`,
  },
  {
    id: "usage",
    method: "GET",
    path: "/v1/usage",
    title: "Usage this month",
    desc: "Results and spend for the current calendar month (UTC).",
    req: `curl ${BASE}/v1/usage -H "Authorization: Bearer $VOUCH_KEY"`,
    res: `{ "periodStart": "2026-09-01T00:00:00.000Z", "runs": 38, "results": 9120, "costUsd": 36.48 }`,
  },
];

const FIELDS: [string, string][] = [
  ["inputUrl", "The URL or username you asked for"],
  ["id / shortCode", "Instagram media id and the code in the post URL"],
  ["type / productType", "Video, Image or Sidecar; clips = reel"],
  ["url", "Canonical post URL"],
  ["caption, hashtags, mentions", "Text and what's tagged in it"],
  ["videoViewCount", "Views"],
  ["videoPlayCount", "Plays (includes replays)"],
  ["likesCount, commentsCount", "Engagement counts"],
  ["sharesCount", "Shares, with includeSharesCount"],
  ["latestComments, firstComment", "Recent comment objects"],
  ["ownerUsername, ownerFullName, ownerId", "Who posted it"],
  ["timestamp", "When it was posted (ISO 8601)"],
  ["videoDuration", "Seconds"],
  ["displayUrl, images, videoUrl", "Media URLs (Instagram CDN, they expire)"],
  ["dimensionsHeight, dimensionsWidth", "Media size"],
  ["musicInfo", "Audio track details"],
  ["taggedUsers, coauthorProducers", "People tagged or co-authoring"],
  ["isSponsored, isCommentsDisabled", "Flags"],
];

export default function DocsPage() {
  return (
    <div className="docs">
      <header className="docs-top">
        <Link href="/"><Logo /></Link>
        <span className="docs-tag">API reference</span>
        <Link href="/dashboard/api-keys" className="btn btn-primary btn-sm docs-cta">Get an API key</Link>
      </header>
      <div className="docs-body">
        <nav className="docs-toc">
          <a href="#intro">Introduction</a>
          <a href="#auth">Authentication</a>
          <a href="#errors">Errors</a>
          <div className="docs-toc-sep">Endpoints</div>
          {ENDPOINTS.map((e) => (
            <a key={e.id} href={`#${e.id}`}><span className={`m m-${e.method.toLowerCase()}`}>{e.method === "DELETE" ? "DEL" : e.method}</span>{e.path}</a>
          ))}
          <div className="docs-toc-sep">Reference</div>
          <a href="#fields">Response fields</a>
          <a href="#billing">Billing</a>
        </nav>

        <article className="docs-main">
          <section id="intro">
            <h1>Vouch API</h1>
            <p className="lede">
              One REST API to pull every metric for public Instagram posts, reels and profiles, and to re-check posts every two hours.
              Base URL: <code>{BASE}</code>. Everything is JSON over HTTPS.
            </p>
          </section>

          <section id="auth">
            <h2>Authentication</h2>
            <p>Create a key under <Link href="/dashboard/api-keys" className="blue">API keys</Link> and send it on every request:</p>
            <pre className="code-block docs-code">{`Authorization: Bearer vch_live_…`}</pre>
            <p>Keys carry full access to your account. Keep them server-side and rotate them from the console.</p>
          </section>

          <section id="errors">
            <h2>Errors</h2>
            <p>Errors use standard status codes and one shape:</p>
            <pre className="code-block docs-code">{`{ "error": { "code": "invalid_input", "message": "Not a valid Instagram URL or username: …" } }`}</pre>
            <table className="table docs-table">
              <tbody>
                <tr><td className="mono-sm">400 invalid_input</td><td>The body or query failed validation.</td></tr>
                <tr><td className="mono-sm">401 unauthorized</td><td>Missing, wrong or revoked key.</td></tr>
                <tr><td className="mono-sm">404 not_found</td><td>No such run or tracked post on your account.</td></tr>
                <tr><td className="mono-sm">500 internal_error</td><td>Our fault. Safe to retry.</td></tr>
              </tbody>
            </table>
          </section>

          {ENDPOINTS.map((e) => (
            <section id={e.id} key={e.id} className="docs-ep">
              <h2><span className={`m m-${e.method.toLowerCase()}`}>{e.method}</span> <code>{e.path}</code></h2>
              <h3>{e.title}</h3>
              <p>{e.desc}</p>
              {e.params && <ParamTable title="Body" rows={e.params} />}
              {e.query && <ParamTable title="Query" rows={e.query} />}
              <div className="docs-pair">
                <div><small>Request</small><pre className="code-block docs-code">{e.req}</pre></div>
                <div><small>Response</small><pre className="code-block docs-code">{e.res}</pre></div>
              </div>
            </section>
          ))}

          <section id="fields">
            <h2>Response fields</h2>
            <p>Each item is the full post object, with the same field names every time. Fields Instagram doesn&apos;t expose for a given post are omitted.</p>
            <table className="table docs-table">
              <tbody>
                {FIELDS.map(([f, d]) => (
                  <tr key={f}><td className="mono-sm">{f}</td><td>{d}</td></tr>
                ))}
              </tbody>
            </table>
          </section>

          <section id="billing">
            <h2>Billing</h2>
            <p>
              <b>$4 per 1,000 results.</b> A result is one post returned once. A tracked post costs one result per check, so 12 a day ($0.048).
              The shares count add-on is +$10 per 1,000. Failed runs and runs that return nothing are free. Every run&apos;s cost is on the run itself
              and in <code>GET /v1/usage</code>.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}

function ParamTable({ title, rows }: { title: string; rows: Param[] }) {
  return (
    <div className="docs-params">
      <small>{title}</small>
      <table className="table docs-table">
        <tbody>
          {rows.map(([n, t, d]) => (
            <tr key={n}><td className="mono-sm nowrap"><b>{n}</b></td><td className="mono-sm dim nowrap">{t}</td><td>{d}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
