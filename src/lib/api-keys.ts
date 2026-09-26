import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { admin } from "@/lib/supabase/admin";

const ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const hashKey = (key: string) => createHash("sha256").update(key).digest("hex");

export function generateKey() {
  const bytes = randomBytes(32);
  let body = "";
  for (const b of bytes) body += ALPHABET[b % ALPHABET.length];
  const key = `vch_live_${body}`;
  return { key, prefix: key.slice(0, 13), hash: hashKey(key) };
}

/** Resolves `Authorization: Bearer vch_live_…` (or `?token=`) to a user id. */
export async function authenticateKey(request: Request): Promise<string | null> {
  const header = request.headers.get("authorization") ?? "";
  const key = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : new URL(request.url).searchParams.get("token");
  if (!key || !key.startsWith("vch_")) return null;

  const db = admin();
  const { data } = await db.from("api_keys").select("id, user_id").eq("key_hash", hashKey(key)).is("revoked_at", null).maybeSingle();
  if (!data) return null;
  void db.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id).then(() => undefined);
  return data.user_id;
}
