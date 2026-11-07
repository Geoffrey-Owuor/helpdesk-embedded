import { NextResponse } from "next/server";
import { Workbook } from "exceljs";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import {
  buildIssuesFilter,
  IssuesFilterParams,
  parseIssuesFilterParams,
} from "@/lib/issues/buildIssuesFilter";
import { xlsxResponse } from "@/lib/excel/workbook";
import {
  addFiltersSheet,
  addIssuesSheet,
  agentFilterLabel,
  exportCountHeaders,
  fetchIssuesForExport,
  issueLinkBuilder,
} from "@/lib/excel/issuesExport";

// Labels for the Filters sheet, in the filter panel's order
const FILTER_LABELS: [keyof IssuesFilterParams, string][] = [
  ["status", "Status"],
  ["reference", "Reference contains"],
  ["fromDate", "Created from"],
  ["toDate", "Created to"],
  ["department", "Department"],
  ["agent", "Agent or collaborator"],
  ["issueType", "Issue type contains"],
  ["issuePriority", "Priority"],
  ["submitter", "Submitter contains"],
];

export const GET = withAuth(async ({ request, user }) => {
  const { role, department, userId, email, username, isSuper } = user;

  const searchParams = request.nextUrl.searchParams;
  const superAdminFilter = searchParams.get("superAdminFilter");
  const agentAdminFilter = searchParams.get("agentAdminFilter");
  const filters = parseIssuesFilterParams(searchParams);

  try {
    // The same visibility and filters as the issues list (/get-issues), so the
    // export always holds what the list shows
    const { whereSql, params } = buildIssuesFilter(
      { role, userId, email, department, isSuper, agentAdminFilter, superAdminFilter },
      filters,
    );

    const { rows, total, exportedAt } = await fetchIssuesForExport(whereSql, params);

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "No issues match the current filters, so there is nothing to export" },
        { status: 404 },
      );
    }

    const workbook = new Workbook();
    workbook.creator = "HelpDesk";
    workbook.created = new Date();

    addIssuesSheet(workbook, rows, await issueLinkBuilder(request, "/dashboard"));

    const viewingOwnSubmissions = agentAdminFilter === "agentAdminFilter";
    const view =
      isSuper && superAdminFilter
        ? "All departments"
        : role === "user" || viewingOwnSubmissions
          ? "Issues you submitted"
          : role === "admin"
            ? `Incoming for ${department}`
            : role === "agent"
              ? "Assigned to you or that you collaborate on"
              : "Your issues";

    // Which department the Department filter matched - see buildIssuesFilter
    const departmentLabel =
      (role === "admin" || role === "agent") && !viewingOwnSubmissions
        ? "Submitter department"
        : "Target department";

    const agentLabel = filters.agent ? await agentFilterLabel(filters.agent) : "";

    addFiltersSheet(workbook, {
      exportedBy: `${username} (${email})`,
      exportedAt,
      view,
      total,
      rowCount: rows.length,
      filters: FILTER_LABELS.filter(([key]) => filters[key]).map(([key, label]) =>
        key === "department"
          ? [departmentLabel, filters[key] as string]
          : [label, key === "agent" ? agentLabel : (filters[key] as string)],
      ),
    });

    return xlsxResponse(workbook, "issues_data.xlsx", exportCountHeaders(rows.length, total));
  } catch (error) {
    console.error("Failed to export issues data to excel:", error);
    return NextResponse.json(
      { message: "Failed to export issues data to excel" },
      { status: 500 },
    );
  }
});
