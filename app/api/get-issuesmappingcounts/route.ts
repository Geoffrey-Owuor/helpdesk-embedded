import { NextResponse } from "next/server";
import { query } from "@/lib/Db";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { DefaultIssuesMappingCounts } from "@/public/assets";

export const GET = withAuth(async ({ user }) => {
  const { isSuper } = user;

  if (!isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const baseQuery = `
    SELECT
    COUNT(*) FILTER (WHERE issue_priority = 'Critical') AS critical_issues,
    COUNT(*) FILTER (WHERE issue_priority = 'High') AS high_issues,
    COUNT(*) FILTER (WHERE issue_priority = 'Medium') AS medium_issues,
    COUNT(*) FILTER (WHERE issue_priority = 'Low') AS low_issues
    FROM issues_mapping
    `;

    // Query execution
    const result = await query(baseQuery);
    const row = result[0];

    const getCount = (val: string) => parseInt(val || "0", 10);

    return NextResponse.json(
      {
        critical: getCount(row.critical_issues),
        high: getCount(row.high_issues),
        medium: getCount(row.medium_issues),
        low: getCount(row.low_issues),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while trying to get issues mapping counts:", error);
    return NextResponse.json(DefaultIssuesMappingCounts, { status: 500 });
  }
});
