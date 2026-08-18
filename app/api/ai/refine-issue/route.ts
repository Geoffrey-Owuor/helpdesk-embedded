import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { checkAndRecordRateLimit } from "@/lib/ai/RateLimit";
import { refineIssueText } from "@/lib/ai/RefineIssueText";

// How often a single logged-in user may call this endpoint. Keyed by
// userId (available since this route is wrapped in withAuth), so each
// user gets their own quota regardless of which PM2 worker handles the
// request -- see lib/ai/RateLimit.ts for why that matters here.
const LIMIT = 10;
const WINDOW_SECONDS = 10 * 60; // 10 minutes

export const POST = withAuth(async ({ request, user }) => {
  try {
    const { allowed } = await checkAndRecordRateLimit(
      `refine:user:${user.userId}`,
      LIMIT,
      WINDOW_SECONDS,
    );

    if (!allowed) {
      return NextResponse.json(
        {
          message: `You've reached the AI refine limit (${LIMIT} per 10 minutes). Please try again shortly.`,
        },
        { status: 429 },
      );
    }

    const { title, description } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { message: "Missing title or description" },
        { status: 400 },
      );
    }

    const refined = await refineIssueText({ title, description });

    return NextResponse.json(refined, { status: 200 });
  } catch (error) {
    console.error("AI refine-issue error:", error);
    return NextResponse.json(
      { message: "Failed to generate AI suggestions, please try again" },
      { status: 500 },
    );
  }
});
