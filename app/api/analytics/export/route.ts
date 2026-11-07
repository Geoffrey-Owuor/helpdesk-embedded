import { NextResponse } from "next/server";
import { Workbook } from "exceljs";
import { query } from "@/lib/Db";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { hasFeatureAccess, FEATURES } from "@/lib/FeatureAccess";
import {
  AnalyticsFilterParams,
  buildAnalyticsIssuesFilter,
  parseAnalyticsFilterParams,
} from "@/lib/analytics/buildAnalyticsIssuesFilter";
import { xlsxResponse } from "@/lib/excel/workbook";
import {
  addFiltersSheet,
  addIssuesSheet,
  exportCountHeaders,
  fetchIssuesForExport,
  issueLinkBuilder,
} from "@/lib/excel/issuesExport";

// Labels for the Filters sheet, in the analytics filter panel's order
const FILTER_LABELS: [keyof AnalyticsFilterParams, string][] = [
  ["department", "Submitter department"],
  ["targetDepartment", "Target department"],
  ["agent", "Agent or collaborator"],
  ["issueType", "Issue type"],
  ["status", "Status"],
  ["priority", "Priority"],
  ["submitter", "Submitter contains"],
  ["reference", "Reference contains"],
  ["fromDate", "Created from"],
  ["toDate", "Created to"],
  ["reopened", "Reopened"],
  ["escalated", "Escalated"],
  ["collaborated", "Collaborated"],
];

// The analytics dashboard's issues (every department), with the same columns
// as the issues list export
export const GET = withAuth(async ({ request, user }) => {
  if (!hasFeatureAccess(user, FEATURES.ANALYTICS)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const filters = parseAnalyticsFilterParams(request.nextUrl.searchParams);

  try {
    const { whereSql, params } = buildAnalyticsIssuesFilter(filters);
    const { rows, total, exportedAt } = await fetchIssuesForExport(whereSql, params);

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "No issues match the current filters, so there is nothing to export" },
        { status: 404 },
      );
    }

    // The agent filter holds an email; name who it is
    let agentLabel = filters.agent ?? "";
    if (filters.agent) {
      const [agent] = await query<{ username: string }>(
        "SELECT username FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
        [filters.agent],
      );
      if (agent) agentLabel = `${agent.username} (${filters.agent})`;
    }

    const workbook = new Workbook();
    workbook.creator = "HelpDesk";
    workbook.created = new Date();

    // The analytics issue page, which every analytics user can open
    addIssuesSheet(workbook, rows, await issueLinkBuilder(request, "/dashboard/analytics"));

    addFiltersSheet(workbook, {
      exportedBy: `${user.username} (${user.email})`,
      exportedAt,
      view: "Issues analytics (all departments)",
      total,
      rowCount: rows.length,
      filters: FILTER_LABELS.filter(([key]) => filters[key]).map(([key, label]) => {
        const value = filters[key];
        if (key === "agent") return [label, agentLabel];
        return [label, value === true ? "Only these issues" : String(value)];
      }),
    });

    return xlsxResponse(workbook, "analytics_issues.xlsx", exportCountHeaders(rows.length, total));
  } catch (error) {
    console.error("Failed to export analytics issues to excel:", error);
    return NextResponse.json(
      { message: "Failed to export analytics issues to excel" },
      { status: 500 },
    );
  }
});
