import { NextResponse } from "next/server";
import { query } from "@/lib/Db";
import { Workbook } from "exceljs";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import {
  buildIssuesFilter,
  IssuesFilterParams,
  parseIssuesFilterParams,
} from "@/lib/issues/buildIssuesFilter";
import {
  EXCEL_DATE_FORMAT,
  excelDate,
  excelText,
  sqlExcelTimestamp,
  styleDataSheet,
  xlsxResponse,
} from "@/lib/excel/workbook";
import { appUrl, basePath, homeUrl } from "@/lib/basePath";
import { getRequestOrigin } from "@/lib/getRequestOrigin";

// Most rows one export returns. A larger result is cut to the newest ones and
// the client is told (X-Export-Total / X-Export-Rows), so it can say so.
const EXPORT_ROW_LIMIT = 10_000;

type ExportRow = Record<string, string | null>;

type ColumnKind = "text" | "date" | "number" | "longText";

// The Issues sheet's columns, in order. `date` columns are selected as
// sqlExcelTimestamp() text and written as real Excel dates; `number` columns
// are counts; `longText` columns wrap.
const COLUMNS: { key: string; header: string; width: number; kind?: ColumnKind }[] = [
  { key: "issue_reference_id", header: "Reference", width: 14 },
  { key: "issue_created_at", header: "Created At", width: 20, kind: "date" },
  { key: "issue_title", header: "Title", width: 32, kind: "longText" },
  { key: "issue_description", header: "Description", width: 50, kind: "longText" },
  { key: "issue_status", header: "Status", width: 14 },
  { key: "issue_priority", header: "Priority", width: 12 },
  { key: "issue_type", header: "Issue Type", width: 22 },
  { key: "issue_submitter_name", header: "Submitter", width: 22 },
  { key: "issue_submitter_department", header: "Submitter Department", width: 22 },
  { key: "issue_target_department", header: "Target Department", width: 22 },
  { key: "issue_agent_name", header: "Agent", width: 22 },
  { key: "issue_agent_email", header: "Agent Email", width: 28 },
  { key: "collaborators", header: "Collaborators", width: 30, kind: "longText" },
  { key: "issue_assigner_name", header: "Assigned By", width: 22 },
  { key: "issue_assigner_email", header: "Assigner Email", width: 28 },
  { key: "issue_remarks", header: "Remarks", width: 40, kind: "longText" },
  { key: "issue_updated_at", header: "Updated At", width: 20, kind: "date" },
  { key: "issue_date_resolved", header: "Resolved At", width: 20, kind: "date" },
  { key: "issue_date_closed", header: "Closed At", width: 20, kind: "date" },
  { key: "attachments_count", header: "Attachments", width: 13, kind: "number" },
  { key: "reopened_count", header: "Times Reopened", width: 15, kind: "number" },
  { key: "issue_reopen_reason", header: "Last Reopen Reason", width: 32, kind: "longText" },
  { key: "issue_reopener_name", header: "Last Reopened By", width: 22 },
  { key: "issue_reopen_date", header: "Last Reopened At", width: 20, kind: "date" },
  { key: "escalated_count", header: "Times Escalated", width: 15, kind: "number" },
  { key: "issue_escalation_reason", header: "Last Escalation Reason", width: 32, kind: "longText" },
  { key: "issue_escalator_name", header: "Last Escalated By", width: 22 },
  { key: "issue_escalation_date", header: "Last Escalated At", width: 20, kind: "date" },
];

// Labels for the Filters sheet, in the filter panel's order
const FILTER_LABELS: [keyof IssuesFilterParams, string][] = [
  ["status", "Status"],
  ["reference", "Reference contains"],
  ["fromDate", "Created from"],
  ["toDate", "Created to"],
  ["department", "Department"],
  ["agent", "Agent or collaborator contains"],
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

    const rowsQuery = `
      SELECT
        a.issue_uuid,
        a.issue_reference_id,
        ${sqlExcelTimestamp("a.issue_created_at")} AS issue_created_at,
        a.issue_title, a.issue_description, a.issue_status, a.issue_priority,
        a.issue_type, a.issue_submitter_name, a.issue_submitter_department,
        a.issue_target_department, a.issue_agent_name, a.issue_agent_email,
        (SELECT STRING_AGG(f.collaborator_name, ', ' ORDER BY f.invited_at)
          FROM issue_collaborators f WHERE f.issue_id = a.issue_uuid) AS collaborators,
        a.issue_assigner_name, a.issue_assigner_email, a.issue_remarks,
        ${sqlExcelTimestamp("a.issue_updated_at")} AS issue_updated_at,
        ${sqlExcelTimestamp("a.issue_date_resolved")} AS issue_date_resolved,
        ${sqlExcelTimestamp("a.issue_date_closed")} AS issue_date_closed,
        (SELECT COUNT(*) FROM issue_attachments g WHERE g.issue_id = a.issue_uuid) AS attachments_count,
        (SELECT COUNT(*) FROM issue_reopening h WHERE h.issue_id = a.issue_uuid) AS reopened_count,
        b.issue_reopen_reason, b.issue_reopener_name,
        ${sqlExcelTimestamp("b.issue_reopen_date")} AS issue_reopen_date,
        (SELECT COUNT(*) FROM issue_escalation i WHERE i.issue_id = a.issue_uuid) AS escalated_count,
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
    // LOCALTIMESTAMP: the export time on the same clock as the issue dates
    const countQuery = `
      SELECT COUNT(*) AS total, ${sqlExcelTimestamp("LOCALTIMESTAMP")} AS exported_at
      FROM issues_table a${whereSql}
    `;

    const [rows, countResult] = await Promise.all([
      query<ExportRow>(rowsQuery, [...params, EXPORT_ROW_LIMIT]),
      query<{ total: string; exported_at: string }>(countQuery, params),
    ]);

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "No issues match the current filters, so there is nothing to export" },
        { status: 404 },
      );
    }

    const total = Math.max(parseInt(countResult[0]?.total || "0", 10), rows.length);
    const truncated = total > rows.length;

    // Absolute links to each issue. NEXT_PUBLIC_BASE_URL is the canonical
    // origin (as in emails); without it, the origin this request came in on.
    const origin = homeUrl ? "" : await getRequestOrigin(request);
    const issueUrl = (uuid: string) =>
      homeUrl ? appUrl(`/dashboard/${uuid}`) : `${origin}${basePath}/dashboard/${uuid}`;

    const workbook = new Workbook();
    workbook.creator = "HelpDesk";
    workbook.created = new Date();

    // --- Issues sheet ---
    const worksheet = workbook.addWorksheet("Issues");
    worksheet.columns = COLUMNS.map(({ key, header, width, kind }) => ({
      key,
      header,
      width,
      style: kind === "date" ? { numFmt: EXCEL_DATE_FORMAT } : undefined,
    }));

    for (const row of rows) {
      const out: Record<string, unknown> = {};
      for (const { key, kind } of COLUMNS) {
        const value = row[key];
        if (kind === "date") out[key] = excelDate(value);
        else if (kind === "number") out[key] = Number(value ?? 0);
        else out[key] = excelText(value);
      }

      const added = worksheet.addRow(out);
      if (row.issue_uuid && row.issue_reference_id) {
        const cell = added.getCell("issue_reference_id");
        cell.value = {
          text: row.issue_reference_id,
          hyperlink: issueUrl(row.issue_uuid),
          tooltip: "Open this issue in HelpDesk",
        };
        cell.font = { color: { argb: "FF1D4ED8" }, underline: true };
      }
    }

    styleDataSheet(
      worksheet,
      COLUMNS.filter((c) => c.kind === "longText").map((c) => c.key),
    );

    // --- Filters sheet: what this file holds and how it was made ---
    const summary = workbook.addWorksheet("Filters");
    summary.columns = [
      { key: "label", width: 32 },
      { key: "value", width: 60 },
    ];

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

    // A row with only a title; styled with the other titles below
    const addSection = (title: string) => summary.addRow([title]);

    addSection("Export");
    summary.addRow(["Exported by", `${username} (${email})`]);
    const exportedAt = summary.addRow([
      "Exported at",
      excelDate(countResult[0]?.exported_at) ?? new Date(),
    ]);
    exportedAt.getCell(2).numFmt = EXCEL_DATE_FORMAT;
    exportedAt.getCell(2).alignment = { horizontal: "left" };
    summary.addRow(["View", view]);
    summary.addRow(["Matching issues", total]);
    summary.addRow(["Issues in this file", rows.length]);
    if (truncated) {
      const note = summary.addRow([
        "Note",
        `Only the newest ${rows.length.toLocaleString()} issues are included. Narrow the filters to export the rest.`,
      ]);
      note.getCell(2).font = { bold: true, color: { argb: "FFB91C1C" } };
    }

    summary.addRow([]);
    addSection("Applied filters");
    const applied = FILTER_LABELS.filter(([key]) => filters[key]);
    if (applied.length === 0) {
      summary.addRow(["None", "Every issue in this view"]);
    } else {
      for (const [key, label] of applied) {
        summary.addRow([key === "department" ? departmentLabel : label, filters[key]]);
      }
    }

    summary.getColumn("label").font = { bold: true };
    summary.getColumn("value").alignment = { wrapText: true, vertical: "top", horizontal: "left" };
    // Section titles keep their own font
    summary.eachRow((row) => {
      if (row.getCell(2).value == null && row.getCell(1).value) {
        row.font = { bold: true, size: 12 };
      }
    });

    return xlsxResponse(workbook, "issues_data.xlsx", {
      "X-Export-Rows": String(rows.length),
      "X-Export-Total": String(total),
    });
  } catch (error) {
    console.error("Failed to export issues data to excel:", error);
    return NextResponse.json(
      { message: "Failed to export issues data to excel" },
      { status: 500 },
    );
  }
});
