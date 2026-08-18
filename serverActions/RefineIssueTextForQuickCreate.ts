"use server";

import { headers } from "next/headers";
import { checkAndRecordRateLimit } from "@/lib/ai/RateLimit";
import { refineIssueText, RefineIssueInput } from "@/lib/ai/RefineIssueText";

export type RefineIssueActionResult =
  | { type: "success"; title: string; description: string }
  | { type: "error"; message: string };

// Same "Refine with AI" feature as app/api/ai/refine-issue/route.ts, but for
// the Quick Create modal, which (like serverActions/QuickCreate.ts) is used
// by people who aren't logged in -- so there's no userId to key the rate
// limit on. Instead we key it on the caller's IP address.
//
// A request-scoped IP isn't given to us directly in Next.js; we read it off
// the "x-forwarded-for" header that a reverse proxy in front of the app
// normally sets (falling back to "x-real-ip"). If neither header is present
// -- e.g. the app is reachable directly with no proxy in front of it -- all
// such callers share one bucket, which is a safe (if coarser) fallback
// rather than skipping the limit entirely.
const LIMIT = 5;
const WINDOW_SECONDS = 10 * 60; // 10 minutes

async function getClientIp(): Promise<string> {
  const headerList = await headers();

  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can be a comma-separated chain of proxies; the first
    // entry is the original client.
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = headerList.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown-ip";
}

export async function RefineIssueTextForQuickCreate(
  input: RefineIssueInput,
): Promise<RefineIssueActionResult> {
  try {
    const ip = await getClientIp();

    const { allowed } = await checkAndRecordRateLimit(
      `refine:ip:${ip}`,
      LIMIT,
      WINDOW_SECONDS,
    );

    if (!allowed) {
      return {
        type: "error",
        message: `You've reached the AI refine limit (${LIMIT} per 10 minutes). Please try again shortly.`,
      };
    }

    if (!input.title || !input.description) {
      return { type: "error", message: "Missing title or description" };
    }

    const refined = await refineIssueText(input);

    return { type: "success", ...refined };
  } catch (error) {
    console.error("AI refine (Quick Create) error:", error);
    return {
      type: "error",
      message: "Failed to generate AI suggestions, please try again",
    };
  }
}
