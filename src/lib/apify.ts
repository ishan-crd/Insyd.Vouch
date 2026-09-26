import "server-only";
import { env } from "@/lib/env";

// Upstream scraper. Nothing here is exposed to customers; they only ever see Vouch runs.
const ACTOR = "apify~instagram-reel-scraper";
const BASE = "https://api.apify.com/v2";

export type UpstreamStatus = "READY" | "RUNNING" | "SUCCEEDED" | "FAILED" | "ABORTING" | "ABORTED" | "TIMING-OUT" | "TIMED-OUT";
export type UpstreamRun = {
  id: string;
  status: UpstreamStatus;
  statusMessage?: string;
  defaultDatasetId: string;
  finishedAt?: string | null;
};

export type UpstreamInput = {
  username: string[];
  resultsLimit?: number;
  onlyPostsNewerThan?: string;
  skipPinnedPosts?: boolean;
  skipTrialReels?: boolean;
  includeSharesCount?: boolean;
};

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${env.apifyToken()}`, "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Upstream ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

export async function startUpstreamRun(input: UpstreamInput): Promise<UpstreamRun> {
  const params = new URLSearchParams();
  const appUrl = env.appUrl();
  // Webhooks need a public URL; locally we fall back to polling.
  if (!/localhost|127\.0\.0\.1/.test(appUrl)) {
    const hooks = [
      {
        eventTypes: ["ACTOR.RUN.SUCCEEDED", "ACTOR.RUN.FAILED", "ACTOR.RUN.ABORTED", "ACTOR.RUN.TIMED_OUT"],
        requestUrl: `${appUrl}/api/webhooks/upstream?secret=${env.webhookSecret()}`,
      },
    ];
    params.set("webhooks", Buffer.from(JSON.stringify(hooks)).toString("base64"));
  }
  const { data } = await call<{ data: UpstreamRun }>(`/acts/${ACTOR}/runs?${params}`, { method: "POST", body: JSON.stringify(input) });
  return data;
}

export async function getUpstreamRun(id: string, waitSecs = 0): Promise<UpstreamRun> {
  const q = waitSecs ? `?waitForFinish=${Math.min(60, waitSecs)}` : "";
  const { data } = await call<{ data: UpstreamRun }>(`/actor-runs/${id}${q}`);
  return data;
}

export async function getUpstreamItems(datasetId: string): Promise<Record<string, unknown>[]> {
  const items: Record<string, unknown>[] = [];
  const limit = 1000;
  for (let offset = 0; ; offset += limit) {
    const page = await call<Record<string, unknown>[]>(
      `/datasets/${datasetId}/items?clean=true&format=json&limit=${limit}&offset=${offset}`,
    );
    items.push(...page);
    if (page.length < limit) return items;
  }
}

export const isTerminal = (s: UpstreamStatus) => s === "SUCCEEDED" || s === "FAILED" || s === "ABORTED" || s === "TIMED-OUT";
