import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { unstable_cache } from "next/cache";

const getGlobalIssueTypes = unstable_cache(
  async (): Promise<string[]> => {
    const baseQuery = `
      SELECT DISTINCT issue_type
      FROM issues_table
      WHERE issue_type IS NOT NULL
      ORDER BY issue_type
    `;
    const rows = await query<{ issue_type: string }>(baseQuery);
    return rows.map((row) => row.issue_type);
  },
  ["get_global_analytics_issue_types"],
  { revalidate: 3600, tags: ["AnalyticsIssueTypes"] },
);

export const GET = withAuth(async ({ user }) => {
  if (user.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const issueTypes = await getGlobalIssueTypes();
    return NextResponse.json(issueTypes, { status: 200 });
  } catch (error) {
    console.error("Error retrieving global issue types list", error);
    return NextResponse.json(
      { message: "Error retrieving the issue types list" },
      { status: 500 },
    );
  }
});
