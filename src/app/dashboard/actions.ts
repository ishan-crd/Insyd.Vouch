"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateKey } from "@/lib/api-keys";
import { requireUser } from "@/lib/auth";
import { InputError, startScrape } from "@/lib/scrape";
import { admin } from "@/lib/supabase/admin";
import { deliver, newWebhookSecret } from "@/lib/webhooks";

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

const PRIVATE_HOST = /^(localhost|.*\.local|.*\.internal|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.|\[?::1\]?|\[?f[cd][0-9a-f]{2}:)/i;

export async function updateProfile(_: FormState, form: FormData): Promise<FormState & { saved?: boolean }> {
  const user = await requireUser();
  const fullName = String(form.get("fullName") ?? "").trim().slice(0, 80);
  const company = String(form.get("company") ?? "").trim().slice(0, 80);
  await admin().from("profiles").update({ full_name: fullName || null, company: company || null }).eq("id", user.id);
  revalidatePath("/dashboard", "layout");
  return { saved: true };
}

export async function saveWebhook(_: FormState, form: FormData): Promise<FormState & { saved?: boolean }> {
  const user = await requireUser();
  const raw = String(form.get("url") ?? "").trim();
  const db = admin();
  if (!raw) {
    await db.from("profiles").update({ webhook_url: null }).eq("id", user.id);
    revalidatePath("/dashboard/settings");
    return { saved: true };
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { error: "Enter a full URL, like https://example.com/hooks/vouch." };
  }
  if (url.protocol !== "https:") return { error: "Webhook URLs must use https." };
  if (PRIVATE_HOST.test(url.hostname)) return { error: "That host isn't reachable from the internet." };

  const { data: p } = await db.from("profiles").select("webhook_secret").eq("id", user.id).single();
  await db
    .from("profiles")
    .update({ webhook_url: url.toString(), ...(p?.webhook_secret ? {} : { webhook_secret: newWebhookSecret() }) })
    .eq("id", user.id);
  revalidatePath("/dashboard/settings");
  return { saved: true };
}

export async function rotateWebhookSecret() {
  const user = await requireUser();
  await admin().from("profiles").update({ webhook_secret: newWebhookSecret() }).eq("id", user.id);
  revalidatePath("/dashboard/settings");
}

export async function sendTestWebhook() {
  const user = await requireUser();
  await deliver(user.id, "ping", { message: "Hello from Vouch. Your webhook is wired up." });
  revalidatePath("/dashboard/settings");
}
