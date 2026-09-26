import type { RunRow, SnapshotRow, TrackedPostRow } from "@/lib/database.types";

export const durationSecs = (r: Pick<RunRow, "started_at" | "finished_at">) =>
  r.finished_at ? Math.max(0, Math.round((Date.parse(r.finished_at) - Date.parse(r.started_at)) / 1000)) : null;

export function runJson(r: RunRow) {
  return {
    id: r.id,
    status: r.status,
    statusMessage: r.status_message,
    origin: r.origin,
    input: r.input,
    resultCount: r.result_count,
    costUsd: Number(r.cost_usd),
    startedAt: r.started_at,
    finishedAt: r.finished_at,
    durationSecs: durationSecs(r),
  };
}

export function trackedJson(t: TrackedPostRow) {
  return {
    id: t.id,
    url: t.url,
    shortCode: t.short_code,
    status: t.status,
    intervalMinutes: t.interval_minutes,
    includeSharesCount: t.include_shares,
    ownerUsername: t.owner_username,
    caption: t.caption,
    latest: { views: t.views, plays: t.plays, likes: t.likes, comments: t.comments, shares: t.shares },
    snapshotCount: t.snapshot_count,
    lastCheckedAt: t.last_checked_at,
    nextCheckAt: t.status === "active" ? t.next_check_at : null,
    endsAt: t.ends_at,
    createdAt: t.created_at,
  };
}

export function snapshotJson(s: SnapshotRow, full = false) {
  return {
    takenAt: s.taken_at,
    views: s.views,
    plays: s.plays,
    likes: s.likes,
    comments: s.comments,
    shares: s.shares,
    runId: s.run_id,
    ...(full ? { data: s.data } : {}),
  };
}
