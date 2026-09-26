import "server-only";
import { z } from "zod";
import { getUpstreamItems, getUpstreamRun, isTerminal, startUpstreamRun, type UpstreamInput, type UpstreamStatus } from "@/lib/apify";
import type { Json, RunRow } from "@/lib/database.types";
import { metricsOf, parseTarget, targetKey, type ScrapedItem, type Target } from "@/lib/instagram";
import { costFor, MAX_TARGETS_PER_REQUEST, TRACK_INTERVAL_MINUTES } from "@/lib/pricing";
import { runJson } from "@/lib/serialize";
import { admin } from "@/lib/supabase/admin";
import { deliver } from "@/lib/webhooks";

export class InputError extends Error {}

// Accepts `urls` (ours) or `username` (the upstream name) so either shape works.
export const ScrapeInputSchema = z
  .object({
    urls: z.array(z.string()).optional(),
    username: z.array(z.string()).optional(),
    resultsLimit: z.number().int().min(1).max(1000).optional(),
    onlyPostsNewerThan: z.string().max(40).optional(),
    skipPinnedPosts: z.boolean().optional(),
    skipTrialReels: z.boolean().optional(),
    includeSharesCount: z.boolean().optional(),
    track: z.boolean().optional(),
    trackForDays: z.number().int().min(1).max(365).optional(),
  })
  .transform(({ urls, username, ...rest }) => ({ ...rest, urls: [...(urls ?? []), ...(username ?? [])] }));

export type ScrapeRequest = z.output<typeof ScrapeInputSchema>;
export type Origin = "WEB" | "API" | "SCHEDULE";

function resolveTargets(raw: string[]): Target[] {
  if (raw.length === 0) throw new InputError("Provide at least one Instagram post URL, reel URL, profile URL or username.");
  if (raw.length > MAX_TARGETS_PER_REQUEST) throw new InputError(`At most ${MAX_TARGETS_PER_REQUEST} inputs per request.`);
  const invalid: string[] = [];
  const seen = new Map<string, Target>();
  for (const r of raw) {
    const t = parseTarget(r);
    if (!t) invalid.push(r);
    else seen.set(targetKey(t), t);
  }
  if (invalid.length) throw new InputError(`Not a valid Instagram URL or username: ${invalid.slice(0, 5).join(", ")}`);
  return [...seen.values()];
}

const runStatusOf = (s: UpstreamStatus): RunRow["status"] =>
  s === "ABORTING" ? "RUNNING" : s === "TIMING-OUT" ? "RUNNING" : s;

/** Creates a job upstream and a customer run pointing at it. */
export async function startScrape(userId: string, origin: Origin, req: ScrapeRequest): Promise<RunRow> {
  const targets = resolveTargets(req.urls);
  const db = admin();

  const input: UpstreamInput = {
    username: targets.map((t) => t.url),
    resultsLimit: req.resultsLimit ?? 25,
    ...(req.onlyPostsNewerThan ? { onlyPostsNewerThan: req.onlyPostsNewerThan } : {}),
    skipPinnedPosts: req.skipPinnedPosts ?? false,
    skipTrialReels: req.skipTrialReels ?? false,
    includeSharesCount: req.includeSharesCount ?? false,
  };

  const { data: job, error: jobErr } = await db.from("jobs").insert({ kind: "ONE_OFF", input: input as Json }).select().single();
  if (jobErr) throw jobErr;

  const { data: run, error: runErr } = await db
    .from("runs")
    .insert({ user_id: userId, job_id: job.id, origin, status: "READY", input: input as Json, targets: targets.map(targetKey) })
    .select()
    .single();
  if (runErr) throw runErr;

  if (req.track) {
    const posts = targets.filter((t) => t.kind === "post");
    if (posts.length) {
      const endsAt = req.trackForDays ? new Date(Date.now() + req.trackForDays * 86_400_000).toISOString() : null;
      await db.from("tracked_posts").upsert(
        posts.map((p) => ({
          user_id: userId,
          url: p.url,
          short_code: p.shortCode,
          status: "active",
          include_shares: input.includeSharesCount ?? false,
          interval_minutes: TRACK_INTERVAL_MINUTES,
          next_check_at: new Date(Date.now() + TRACK_INTERVAL_MINUTES * 60_000).toISOString(),
          ends_at: endsAt,
        })),
        { onConflict: "user_id,short_code" },
      );
    }
  }

  try {
    const up = await startUpstreamRun(input);
    await db.from("jobs").update({ upstream_run_id: up.id, upstream_dataset_id: up.defaultDatasetId, status: up.status }).eq("id", job.id);
    const { data } = await db.from("runs").update({ status: "RUNNING" }).eq("id", run.id).select().single();
    return data ?? run;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not start the scraper.";
    console.error("[scrape] upstream start failed", message);
    await db.from("jobs").update({ status: "FAILED", status_message: message, processed_at: new Date().toISOString() }).eq("id", job.id);
    const { data } = await db
      .from("runs")
      .update({ status: "FAILED", status_message: "The scraper could not be started. You were not charged.", finished_at: new Date().toISOString() })
      .eq("id", run.id)
      .select()
      .single();
    return data ?? run;
  }
}

/**
 * Pulls an upstream job's state. When it has finished, distributes the items to every run that points at it,
 * bills each run, and writes tracking snapshots. Safe to call repeatedly and concurrently (webhook + poll + cron).
 */
export async function processJob(jobId: string): Promise<void> {
  const db = admin();
  const { data: job } = await db.from("jobs").select().eq("id", jobId).single();
  if (!job || job.processed_at || !job.upstream_run_id) return;

  const up = await getUpstreamRun(job.upstream_run_id);
  if (!isTerminal(up.status)) {
    if (job.status !== up.status) {
      await db.from("jobs").update({ status: up.status }).eq("id", jobId);
      await db.from("runs").update({ status: runStatusOf(up.status) }).eq("job_id", jobId).in("status", ["READY", "RUNNING"]);
    }
    return;
  }

  // Claim the job so only one caller distributes results.
  const { data: claimed } = await db
    .from("jobs")
    .update({ processed_at: new Date().toISOString(), status: up.status, status_message: up.statusMessage ?? null, finished_at: up.finishedAt ?? new Date().toISOString() })
    .eq("id", jobId)
    .is("processed_at", null)
    .select("id");
  if (!claimed?.length) return;

  try {
    const items = (await getUpstreamItems(up.defaultDatasetId)) as ScrapedItem[];
    await db.from("jobs").update({ item_count: items.length }).eq("id", jobId);

    const { data: runs } = await db.from("runs").select().eq("job_id", jobId);
    for (const run of runs ?? []) {
      const targets = new Set(run.targets);
      const mine =
        job.kind === "ONE_OFF"
          ? items
          : items.filter((i) => targets.has(`post:${i.shortCode}`) || targets.has(`profile:${String(i.ownerUsername ?? "").toLowerCase()}`));
      await finishRun(run, mine, up.status, up.statusMessage);
    }
  } catch (e) {
    // Release the claim so the next poll retries.
    await db.from("jobs").update({ processed_at: null }).eq("id", jobId);
    throw e;
  }
}

async function finishRun(run: RunRow, items: ScrapedItem[], status: UpstreamStatus, upstreamMessage?: string) {
  const db = admin();
  for (let i = 0; i < items.length; i += 500) {
    const chunk = items.slice(i, i + 500).map((data, k) => ({
      run_id: run.id,
      user_id: run.user_id,
      position: i + k,
      short_code: typeof data.shortCode === "string" ? data.shortCode : null,
      data: data as Json,
    }));
    const { error } = await db.from("run_items").insert(chunk);
    if (error) throw error;
  }

  const includeShares = Boolean((run.input as { includeSharesCount?: boolean })?.includeSharesCount);
  const finalStatus = runStatusOf(status);
  const message =
    finalStatus === "SUCCEEDED"
      ? items.length
        ? `Succeeded with ${items.length} ${items.length === 1 ? "result" : "results"}`
        : "Finished with no results. The post may be private, deleted or not a reel."
      : `Run ${finalStatus.toLowerCase()}${upstreamMessage ? `: ${upstreamMessage}` : ""}`;

  const { data: finished } = await db
    .from("runs")
    .update({
      status: finalStatus,
      result_count: items.length,
      cost_usd: costFor(items.length, includeShares),
      status_message: message,
      finished_at: new Date().toISOString(),
    })
    .eq("id", run.id)
    .select()
    .single();

  const snapshots = await recordSnapshots(run, items);
  if (finished) await deliver(run.user_id, finalStatus === "SUCCEEDED" ? "run.succeeded" : "run.failed", { run: runJson(finished) });
  if (snapshots.length) await deliver(run.user_id, "snapshots.created", { runId: run.id, snapshots });
}

/** Every returned post that the user tracks gets a snapshot and refreshed headline numbers. Returns what was recorded. */
async function recordSnapshots(run: RunRow, items: ScrapedItem[]) {
  const byCode = new Map<string, ScrapedItem>();
  for (const i of items) if (typeof i.shortCode === "string") byCode.set(i.shortCode, i);
  if (!byCode.size) return [];

  const db = admin();
  const { data: tracked } = await db
    .from("tracked_posts")
    .select("id, short_code, snapshot_count")
    .eq("user_id", run.user_id)
    .in("status", ["active", "ended"])
    .in("short_code", [...byCode.keys()]);
  if (!tracked?.length) return [];

  const now = new Date().toISOString();
  await db.from("snapshots").insert(
    tracked.map((t) => {
      const item = byCode.get(t.short_code)!;
      return { tracked_post_id: t.id, user_id: run.user_id, run_id: run.id, taken_at: now, ...metricsOf(item), data: item as Json };
    }),
  );
  await Promise.all(
    tracked.map((t) => {
      const item = byCode.get(t.short_code)!;
      return db
        .from("tracked_posts")
        .update({
          ...metricsOf(item),
          latest: item as Json,
          last_checked_at: now,
          snapshot_count: t.snapshot_count + 1,
          owner_username: item.ownerUsername ?? null,
          caption: typeof item.caption === "string" ? item.caption.slice(0, 500) : null,
          display_url: item.displayUrl ?? null,
          product_type: item.productType ?? null,
        })
        .eq("id", t.id);
    }),
  );
  return tracked.map((t) => ({ trackedPostId: t.id, shortCode: t.short_code, takenAt: now, ...metricsOf(byCode.get(t.short_code)!) }));
}

/** Refreshes a run whose job is still open. Used by run pages and the API so results appear without webhooks. */
export async function refreshRun(run: RunRow): Promise<RunRow> {
  if ((run.status !== "READY" && run.status !== "RUNNING") || !run.job_id) return run;
  try {
    await processJob(run.job_id);
  } catch (e) {
    console.error("[scrape] refresh failed", e);
  }
  const { data } = await admin().from("runs").select().eq("id", run.id).single();
  return data ?? run;
}

/** Blocks until the run finishes or `maxSecs` elapses, then returns its latest state. */
export async function waitForRun(run: RunRow, maxSecs: number): Promise<RunRow> {
  const deadline = Date.now() + maxSecs * 1000;
  let current = run;
  while ((current.status === "READY" || current.status === "RUNNING") && current.job_id && Date.now() < deadline) {
    const { data: job } = await admin().from("jobs").select("upstream_run_id").eq("id", current.job_id).single();
    if (!job?.upstream_run_id) break;
    const left = Math.max(1, Math.floor((deadline - Date.now()) / 1000));
    await getUpstreamRun(job.upstream_run_id, Math.min(left, 30));
    current = await refreshRun(current);
  }
  return current;
}

/**
 * The tracking scheduler. Batches every due post (across all customers) into as few upstream jobs as possible,
 * then gives each customer their own run for the posts they track. Also sweeps jobs whose webhook never arrived.
 */
export async function runScheduler() {
  const db = admin();
  const now = new Date();

  await db.from("tracked_posts").update({ status: "ended" }).eq("status", "active").lt("ends_at", now.toISOString());

  const horizon = new Date(now.getTime() + 5 * 60_000).toISOString();
  const { data: due } = await db
    .from("tracked_posts")
    .select("id, user_id, url, short_code, include_shares, interval_minutes")
    .eq("status", "active")
    .lte("next_check_at", horizon)
    .order("next_check_at")
    .limit(2000);

  let scheduledRuns = 0;
  for (const withShares of [false, true]) {
    const group = (due ?? []).filter((d) => d.include_shares === withShares);
    if (!group.length) continue;

    const urls = [...new Map(group.map((g) => [g.short_code, g.url])).values()];
    const input: UpstreamInput = { username: urls, resultsLimit: 1, includeSharesCount: withShares };
    const { data: job, error } = await db.from("jobs").insert({ kind: "SCHEDULE", input: input as Json }).select().single();
    if (error) throw error;

    const byUser = new Map<string, typeof group>();
    for (const g of group) byUser.set(g.user_id, [...(byUser.get(g.user_id) ?? []), g]);

    let started = true;
    try {
      const up = await startUpstreamRun(input);
      await db.from("jobs").update({ upstream_run_id: up.id, upstream_dataset_id: up.defaultDatasetId, status: up.status }).eq("id", job.id);
    } catch (e) {
      started = false;
      console.error("[scheduler] upstream start failed", e);
      await db.from("jobs").update({ status: "FAILED", status_message: String(e), processed_at: now.toISOString() }).eq("id", job.id);
    }

    if (started) {
      const rows = [...byUser.entries()].map(([userId, posts]) => ({
        user_id: userId,
        job_id: job.id,
        origin: "SCHEDULE",
        status: "RUNNING",
        input: { username: posts.map((p) => p.url), resultsLimit: 1, includeSharesCount: withShares } as Json,
        targets: posts.map((p) => `post:${p.short_code}`),
      }));
      await db.from("runs").insert(rows);
      scheduledRuns += rows.length;
    }

    // On failure retry in 10 minutes rather than waiting a full interval.
    await Promise.all(
      group.map((g) =>
        db
          .from("tracked_posts")
          .update({ next_check_at: new Date(now.getTime() + (started ? g.interval_minutes : 10) * 60_000).toISOString() })
          .eq("id", g.id),
      ),
    );
  }

  // Sweep: finish jobs whose completion webhook we missed.
  const { data: open } = await db
    .from("jobs")
    .select("id")
    .is("processed_at", null)
    .not("upstream_run_id", "is", null)
    .lt("created_at", new Date(now.getTime() - 60_000).toISOString())
    .limit(50);
  for (const j of open ?? []) {
    try {
      await processJob(j.id);
    } catch (e) {
      console.error("[scheduler] sweep failed", j.id, e);
    }
  }

  return { duePosts: due?.length ?? 0, scheduledRuns, sweptJobs: open?.length ?? 0 };
}
