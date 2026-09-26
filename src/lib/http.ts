import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { InputError } from "@/lib/scrape";

export const ok = (data: unknown, status = 200) => NextResponse.json(data, { status });

export const fail = (status: number, code: string, message: string) => NextResponse.json({ error: { code, message } }, { status });

export const unauthorized = () =>
  fail(401, "unauthorized", "Missing or invalid API key. Send it as `Authorization: Bearer vch_live_…`.");

export function handleError(e: unknown) {
  if (e instanceof InputError) return fail(400, "invalid_input", e.message);
  if (e instanceof ZodError) return fail(400, "invalid_input", e.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`).join("; "));
  if (e instanceof SyntaxError) return fail(400, "invalid_json", "Request body must be valid JSON.");
  console.error("[api]", e);
  return fail(500, "internal_error", "Something went wrong on our side. Please retry.");
}
