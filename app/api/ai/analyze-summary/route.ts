import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { hasFeatureAccess, FEATURES } from "@/lib/FeatureAccess";
import { checkAndRecordRateLimit } from "@/lib/ai/RateLimit";
import { geminiFlashLite } from "@/lib/ai/GeminiModel";
import { AnalyticsInsightSchema } from "@/lib/ai/Schemas";
import { AnalyticsSummary } from "@/components/Modules/IssuesAnalytics/types";

const LIMIT = 20;
const WINDOW_SECONDS = 60 * 60; // 1 hour

export const POST = withAuth(async ({ request, user }) => {
  // Same gate as GET /api/analytics/issues-summary -- this endpoint only
  // makes sense for people who can already see the summary it analyzes.
  if (!hasFeatureAccess(user, FEATURES.ANALYTICS)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { allowed } = await checkAndRecordRateLimit(
      `analyze:user:${user.userId}`,
      LIMIT,
      WINDOW_SECONDS,
    );

    if (!allowed) {
      return NextResponse.json(
        {
          message: `You've reached the AI analysis limit (${LIMIT} per hour). Please try again later.`,
        },
        { status: 429 },
      );
    }

    const body = (await request.json()) as {
      summary: AnalyticsSummary;
      filters: Record<string, unknown> | null;
    };

    if (!body?.summary) {
      return NextResponse.json(
        { message: "Missing analytics summary" },
        { status: 400 },
      );
    }

    // We only ever send the already-aggregated summary object (counts and
    // breakdowns), never the raw filtered issue rows -- it stays a few KB
    // regardless of how many issues match the current filters, so this is
    // well within even a free-tier context window.
    const { output } = await generateText({
      model: geminiFlashLite,
      output: Output.object({ schema: AnalyticsInsightSchema }),
      prompt: `You are an assistant summarizing helpdesk analytics for an internal IT/support team.

Given the JSON summary below (status/priority counts, reopened/escalated/collaborated counts, average resolution and stale times in seconds, and breakdowns by issue type, agent, and department), write:
- "headline": one sentence capturing the single most important takeaway.
- "insights": up to 6 short, concrete observations about volume, bottlenecks, or notable breakdown entries (skip anything with zero/negligible data).
- "recommendations": up to 5 short, actionable suggestions for the team based on the data.

Only use what's in the data below -- do not invent numbers. Convert seconds to an average of either minutes/hrs/days/weeks/months depending on the seconds length in the JSON summary.

Active filters: ${JSON.stringify(body.filters ?? {})}
Summary data: ${JSON.stringify(body.summary)}`,
    });

    return NextResponse.json(output, { status: 200 });
  } catch (error) {
    console.error("AI analyze-summary error:", error);
    return NextResponse.json(
      { message: "Failed to generate AI insights, please try again" },
      { status: 500 },
    );
  }
});
