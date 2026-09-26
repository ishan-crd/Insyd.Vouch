import { ArrowLeft, ExternalLink, Pause, Play, RotateCw } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setTracking } from "@/app/dashboard/actions";
import { LineChart } from "@/components/app/charts";
import { Kpi, PageHead, StatusBadge } from "@/components/app/ui";
import { requireUser } from "@/lib/auth";
import { dateTime, hoursAgo, img, num, relative } from "@/lib/format";
import { admin } from "@/lib/supabase/admin";

const METRICS = [
  { k: "views", label: "Views" },
  { k: "plays", label: "Plays" },
  { k: "likes", label: "Likes" },
  { k: "comments", label: "Comments" },
  { k: "shares", label: "Shares" },
] as const;
type MetricKey = (typeof METRICS)[number]["k"];

function Delta({ now, before }: { now: number | null; before: number | null }) {
  if (now === null || before === null) return null;
  const d = now - before;
  if (d === 0) return <span className="delta">no change in 24h</span>;
  return <span className={`delta ${d > 0 ? "up" : "down"}`}>{d > 0 ? "+" : ""}{d.toLocaleString("en-US")} in 24h</span>;
}

export default async function TrackedPostPage({ params, searchParams }: PageProps<"/dashboard/tracked/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const m = ((await searchParams).m as MetricKey) ?? "views";
  const metric = METRICS.find((x) => x.k === m) ?? METRICS[0];

  const db = admin();
  const { data: post } = await db.from("tracked_posts").select().eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!post) notFound();
  const { data: snaps } = await db
    .from("snapshots")
    .select("id, taken_at, views, plays, likes, comments, shares, run_id")
    .eq("tracked_post_id", id)
    .order("taken_at")
    .limit(5000);
  const history = snaps ?? [];

  const dayAgo = hoursAgo(24);
  const before = [...history].reverse().find((s) => s.taken_at <= dayAgo) ?? history[0] ?? null;
  const thumb = img(post.display_url);
  const toggle = setTracking.bind(null, post.id, post.status === "active" ? "ended" : "active");

  return (
    <>
      <PageHead
        back={<Link href="/dashboard/tracked" className="back" aria-label="Back"><ArrowLeft size={18} /></Link>}
        title={post.owner_username ? `@${post.owner_username}` : post.short_code}
        sub={
          <div className="run-meta">
            <StatusBadge status={post.status} />
            <span>{post.snapshot_count} snapshots</span>
            <span>Last check {relative(post.last_checked_at)}</span>
            {post.status === "active" && <span>Next {relative(post.next_check_at)}</span>}
            {post.ends_at && <span>Ends {dateTime(post.ends_at).slice(0, 10)}</span>}
          </div>
        }
        actions={
          <>
            <a href={post.url} target="_blank" rel="noreferrer" className="btn btn-ghost">
              Open on Instagram <ExternalLink size={14} />
            </a>
            <form action={toggle}>
              <button className={`btn ${post.status === "active" ? "btn-ghost" : "btn-primary"}`}>
                {post.status === "active" ? <><Pause size={15} /> Stop tracking</> : <><RotateCw size={15} /> Resume</>}
              </button>
            </form>
          </>
        }
      />

      <div className="post-head card">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="post-head-img" />
        ) : (
          <span className="post-head-img thumb-ph"><Play size={18} fill="#fff" stroke="none" /></span>
        )}
        <div className="post-head-body">
          <p className="post-caption">{post.caption || "No caption."}</p>
          <div className="kpis">
            <Kpi label="Views" value={num(post.views)} hint={<Delta now={post.views} before={before?.views ?? null} />} />
            <Kpi label="Likes" value={num(post.likes)} hint={<Delta now={post.likes} before={before?.likes ?? null} />} />
            <Kpi label="Comments" value={num(post.comments)} hint={<Delta now={post.comments} before={before?.comments ?? null} />} />
            <Kpi label="Shares" value={post.include_shares ? num(post.shares) : "off"} hint={post.include_shares ? <Delta now={post.shares} before={before?.shares ?? null} /> : "Enable when tracking"} />
          </div>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>{metric.label} over time</h2>
          <div className="seg">
            {METRICS.map((x) => (
              <Link key={x.k} href={`?m=${x.k}`} scroll={false} className={metric.k === x.k ? "on" : ""}>{x.label}</Link>
            ))}
          </div>
        </div>
        <div className="panel-body">
          <LineChart label={metric.label} points={history.map((s) => ({ t: s.taken_at, v: s[metric.k] }))} />
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><h2>Snapshots</h2><span className="muted-sm">Newest first</span></div>
        <div className="table-scroll" data-lenis-prevent>
          <table className="table">
            <thead>
              <tr><th>Taken at</th><th className="r">Views</th><th className="r">Plays</th><th className="r">Likes</th><th className="r">Comments</th><th className="r">Shares</th><th>Run</th></tr>
            </thead>
            <tbody>
              {[...history].reverse().map((s) => (
                <tr key={s.id}>
                  <td className="nowrap">{dateTime(s.taken_at)}</td>
                  <td className="r num">{num(s.views)}</td>
                  <td className="r num">{num(s.plays)}</td>
                  <td className="r num">{num(s.likes)}</td>
                  <td className="r num">{num(s.comments)}</td>
                  <td className="r num">{num(s.shares)}</td>
                  <td>{s.run_id ? <Link className="blue mono-sm" href={`/dashboard/runs/${s.run_id}`}>{s.run_id.slice(0, 8)}</Link> : "—"}</td>
                </tr>
              ))}
              {!history.length && (
                <tr><td colSpan={7} className="muted-sm">The first snapshot lands when the initial check finishes.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
