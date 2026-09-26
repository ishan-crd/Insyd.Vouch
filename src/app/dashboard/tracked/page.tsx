import { Activity, Play } from "lucide-react";
import Link from "next/link";
import { ProxiedImg } from "@/components/app/proxied-img";
import { Sparkline } from "@/components/app/sparkline";
import { TrackForm } from "@/components/app/track-form";
import { Empty, PageHead, StatusBadge } from "@/components/app/ui";
import { requireUser } from "@/lib/auth";
import { compact, hoursAgo, img, relative } from "@/lib/format";
import { admin } from "@/lib/supabase/admin";

export default async function TrackedPage({ searchParams }: PageProps<"/dashboard/tracked">) {
  const user = await requireUser();
  const show = (await searchParams).show === "all" ? "all" : "active";
  const db = admin();

  let query = db.from("tracked_posts").select().eq("user_id", user.id);
  if (show === "active") query = query.eq("status", "active");
  const { data: posts } = await query.order("created_at", { ascending: false }).limit(300);

  const ids = (posts ?? []).map((p) => p.id);
  const since = hoursAgo(48);
  const { data: snaps } = ids.length
    ? await db
        .from("snapshots")
        .select("tracked_post_id, views, likes, taken_at")
        .in("tracked_post_id", ids)
        .gte("taken_at", since)
        .order("taken_at")
        .limit(10_000)
    : { data: [] };
  const series = new Map<string, (number | null)[]>();
  for (const s of snaps ?? []) series.set(s.tracked_post_id, [...(series.get(s.tracked_post_id) ?? []), s.views ?? s.likes]);

  const { count: activeCount } = await db
    .from("tracked_posts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "active");

  return (
    <>
      <PageHead
        title="Tracked posts"
        sub={<>{(activeCount ?? 0).toLocaleString()} posts re-checked every 2 hours · each check is one result ($0.004)</>}
      />
      <TrackForm />

      <div className="toolbar">
        <div className="seg">
          <Link href="/dashboard/tracked" className={show === "active" ? "on" : ""}>
            Active
          </Link>
          <Link href="/dashboard/tracked?show=all" className={show === "all" ? "on" : ""}>
            All
          </Link>
        </div>
      </div>

      {!posts?.length ? (
        <Empty icon={<Activity size={20} />} title={show === "active" ? "Nothing tracked yet" : "No posts"}>
          Paste a reel or post link above. We&apos;ll fetch it now and every two hours after that, building a full growth history.
        </Empty>
      ) : (
        <div className="table-card">
          <table className="table">
            <thead>
              <tr>
                <th>Post</th>
                <th className="r">Views</th>
                <th className="r">Likes</th>
                <th className="r">Comments</th>
                <th className="r">Shares</th>
                <th>48h trend</th>
                <th>Last check</th>
                <th>Next check</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => {
                const thumb = img(p.display_url);
                return (
                  <tr key={p.id} className="row-link">
                    <td>
                      <Link href={`/dashboard/tracked/${p.id}`} className="post-cell">
                        {thumb ? (
                          <ProxiedImg src={thumb} className="thumb sm" />
                        ) : (
                          <span className="thumb sm thumb-ph">
                            <Play size={11} fill="#fff" stroke="none" />
                          </span>
                        )}
                        <span className="post-cell-text">
                          <b>{p.owner_username ? `@${p.owner_username}` : p.short_code}</b>
                          <small>{p.caption || (p.snapshot_count ? "No caption" : "Waiting for first check…")}</small>
                        </span>
                      </Link>
                    </td>
                    <td className="r num">{compact(p.views ?? p.plays)}</td>
                    <td className="r num">{compact(p.likes)}</td>
                    <td className="r num">{compact(p.comments)}</td>
                    <td className="r num">{p.include_shares ? compact(p.shares) : <span className="dim">off</span>}</td>
                    <td>
                      <Sparkline values={series.get(p.id) ?? []} />
                    </td>
                    <td className="nowrap muted-sm">{relative(p.last_checked_at)}</td>
                    <td className="nowrap muted-sm">{p.status === "active" ? relative(p.next_check_at) : "—"}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
