"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateKey } from "@/lib/api-keys";
import { requireUser } from "@/lib/auth";
import { InputError, startScrape } from "@/lib/scrape";
import { admin } from "@/lib/supabase/admin";

export type FormState = { error?: string } | undefined;

const lines = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

export async function runScrape(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const limit = Number(form.get("resultsLimit"));
  const days = Number(form.get("trackForDays"));
  let runId: string;
  try {
    const run = await startScrape(user.id, "WEB", {
      urls: lines(form.get("urls")),
      resultsLimit: Number.isFinite(limit) && limit > 0 ? Math.min(1000, Math.floor(limit)) : 25,
      onlyPostsNewerThan: String(form.get("onlyPostsNewerThan") ?? "").trim() || undefined,
      skipPinnedPosts: form.get("skipPinnedPosts") === "on",
      skipTrialReels: form.get("skipTrialReels") === "on",
      includeSharesCount: form.get("includeSharesCount") === "on",
      track: form.get("track") === "on",
      trackForDays: form.get("track") === "on" && days > 0 ? Math.min(365, Math.floor(days)) : undefined,
    });
    runId = run.id;
  } catch (e) {
    if (e instanceof InputError) return { error: e.message };
    console.error(e);
    return { error: "Could not start the run. Please try again." };
  }
  redirect(`/dashboard/runs/${runId}`);
}

export async function trackPosts(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const urls = lines(form.get("urls"));
  if (urls.some((u) => !/instagram\.com\/(?:[\w.]+\/)?(reel|reels|p|tv)\//i.test(u))) {
    return { error: "Only post or reel links can be tracked (instagram.com/reel/… or /p/…)." };
  }
  try {
    await startScrape(user.id, "WEB", { urls, track: true, includeSharesCount: form.get("includeSharesCount") === "on" });
  } catch (e) {
    if (e instanceof InputError) return { error: e.message };
    console.error(e);
    return { error: "Could not start tracking. Please try again." };
  }
  revalidatePath("/dashboard/tracked");
  return undefined;
}

export async function setTracking(id: string, status: "active" | "ended") {
  const user = await requireUser();
  await admin()
    .from("tracked_posts")
    .update(status === "active" ? { status, next_check_at: new Date().toISOString() } : { status })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/dashboard/tracked");
  revalidatePath(`/dashboard/tracked/${id}`);
}

export async function createApiKey(_: unknown, form: FormData): Promise<{ key?: string; error?: string }> {
  const user = await requireUser();
  const name = String(form.get("name") ?? "").trim().slice(0, 60) || "Default key";
  const { key, prefix, hash } = generateKey();
  const { error } = await admin().from("api_keys").insert({ user_id: user.id, name, prefix, key_hash: hash });
  if (error) return { error: "Could not create the key." };
  revalidatePath("/dashboard/api-keys");
  return { key };
}

export async function revokeApiKey(id: string) {
  const user = await requireUser();
  await admin().from("api_keys").update({ revoked_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id);
  revalidatePath("/dashboard/api-keys");
}
