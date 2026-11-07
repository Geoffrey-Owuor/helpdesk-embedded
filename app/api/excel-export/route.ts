import { NextResponse } from "next/server";
import { query } from "@/lib/Db";
import { Workbook } from "exceljs";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import {
  buildIssuesFilter,
  parseIssuesFilterParams,
} from "@/lib/issues/buildIssuesFilter";
import {
  EXCEL_DATE_FORMAT,
  excelDate,
  sqlExcelTimestamp,
  xlsxResponse,
} from "@/lib/excel/workbook";

// Most rows one export returns. A larger result is cut to the newest ones and
// the client is told (X-Export-Total / X-Export-Rows), so it can say so.
const EXPORT_ROW_LIMIT = 10_000;

type ExportRow = Record<string, string | null>;

// The sheet's columns, in order. `date` columns are selected as
// sqlExcelTimestamp() text and written as real Excel dates.
const COLUMNS: { key: string; header: string; width: number; date?: boolean }[] = [
  { key: "issue_reference_id", header: "Reference", width: 14 },
  { key: "issue_created_at", header: "Created At", width: 20, date: true },
  { key: "issue_title", header: "Title", width: 30 },
  { key: "issue_description", header: "Description", width: 40 },
  { key: "issue_status", header: "Status", width: 14 },
  { key: "issue_priority", header: "Priority", width: 12 },
  { key: "issue_type", header: "Issue Type", width: 22 },
  { key: "issue_submitter_name", header: "Submitter", width: 22 },
  { key: "issue_submitter_department", header: "Submitter Department", width: 22 },
  { key: "issue_target_department", header: "Target Department", width: 22 },
  { key: "issue_agent_name", header: "Agent", width: 22 },
  { key: "issue_agent_email", header: "Agent Email", width: 28 },
  { key: "issue_assigner_name", header: "Assigned By", width: 22 },
  { key: "issue_assigner_email", header: "Assigner Email", width: 28 },
  { key: "issue_remarks", header: "Remarks", width: 40 },
  { key: "issue_updated_at", header: "Updated At", width: 20, date: true },
  { key: "issue_date_resolved", header: "Resolved At", width: 20, date: true },
  { key: "issue_date_closed", header: "Closed At", width: 20, date: true },
  { key: "issue_reopen_reason", header: "Last Reopen Reason", width: 30 },
  { key: "issue_reopener_name", header: "Last Reopened By", width: 22 },
  { key: "issue_reopen_date", header: "Last Reopened At", width: 20, date: true },
  { key: "issue_escalation_reason", header: "Last Escalation Reason", width: 30 },
  { key: "issue_escalator_name", header: "Last Escalated By", width: 22 },
  { key: "issue_escalation_date", header: "Last Escalated At", width: 20, date: true },
];

export const GET = withAuth(async ({ request, user }) => {
  const { role, department, userId, email, isSuper } = user;

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

    const rowsQuery = `
      SELECT
        a.issue_reference_id,
        ${sqlExcelTimestamp("a.issue_created_at")} AS issue_created_at,
        a.issue_title, a.issue_description, a.issue_status, a.issue_priority,
        a.issue_type, a.issue_submitter_name, a.issue_submitter_department,
        a.issue_target_department, a.issue_agent_name, a.issue_agent_email,
        a.issue_assigner_name, a.issue_assigner_email, a.issue_remarks,
        ${sqlExcelTimestamp("a.issue_updated_at")} AS issue_updated_at,
        ${sqlExcelTimestamp("a.issue_date_resolved")} AS issue_date_resolved,
        ${sqlExcelTimestamp("a.issue_date_closed")} AS issue_date_closed,
        b.issue_reopen_reason, b.issue_reopener_name,
        ${sqlExcelTimestamp("b.issue_reopen_date")} AS issue_reopen_date,
        c.issue_escalation_reason, c.issue_escalator_name,
        ${sqlExcelTimestamp("c.issue_escalation_date")} AS issue_escalation_date
      FROM issues_table a
      LEFT JOIN LATERAL (
        SELECT r.issue_reopen_reason, r.issue_reopener_name, r.issue_reopen_date
        FROM issue_reopening r WHERE r.issue_id = a.issue_uuid
        ORDER BY r.id DESC LIMIT 1
      ) b ON TRUE
      LEFT JOIN LATERAL (
        SELECT e.issue_escalation_reason, e.issue_escalator_name, e.issue_escalation_date
        FROM issue_escalation e WHERE e.issue_id = a.issue_uuid
        ORDER BY e.id DESC LIMIT 1
      ) c ON TRUE
      ${whereSql}
      ORDER BY a.issue_created_at DESC
      LIMIT $${params.length + 1}
    `;
    const countQuery = `SELECT COUNT(*) AS total FROM issues_table a${whereSql}`;

    const [rows, countResult] = await Promise.all([
      query<ExportRow>(rowsQuery, [...params, EXPORT_ROW_LIMIT]),
      query<{ total: string }>(countQuery, params),
    ]);

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "No issues match the current filters, so there is nothing to export" },
        { status: 404 },
      );
    }

    const total = parseInt(countResult[0]?.total || "0", 10);

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Issues");

    worksheet.columns = COLUMNS.map(({ key, header, width, date }) => ({
      key,
      header,
      width,
      style: date ? { numFmt: EXCEL_DATE_FORMAT } : undefined,
    }));
    worksheet.getRow(1).font = { bold: true };

    const dateKeys = COLUMNS.filter((c) => c.date).map((c) => c.key);
    worksheet.addRows(
      rows.map((row) => {
        const out: Record<string, string | Date | null> = { ...row };
        for (const key of dateKeys) out[key] = excelDate(row[key]);
        return out;
      }),
    );

    return xlsxResponse(workbook, "issues_data.xlsx", {
      "X-Export-Rows": String(rows.length),
      "X-Export-Total": String(Math.max(total, rows.length)),
    });
  } catch (error) {
    console.error("Failed to export issues data to excel:", error);
    return NextResponse.json(
      { message: "Failed to export issues data to excel" },
      { status: 500 },
    );
  }
});
