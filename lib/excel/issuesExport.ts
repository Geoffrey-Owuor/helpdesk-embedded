import type { Workbook } from "exceljs";
import { query } from "@/lib/Db";
import {
  EXCEL_DATE_FORMAT,
  excelDate,
  excelText,
  sqlExcelTimestamp,
  styleDataSheet,
} from "@/lib/excel/workbook";
import { appUrl, basePath, homeUrl } from "@/lib/basePath";
import { getRequestOrigin } from "@/lib/getRequestOrigin";

// The issues export, shared by the issues list (app/api/excel-export) and the
// analytics dashboard (app/api/analytics/export). Each route builds its own
// WHERE clause and Filters sheet lines; the Issues sheet and its query are here.

// Most rows one export returns. A larger result is cut to the newest ones and
// the client is told (X-Export-Total / X-Export-Rows), so it can say so.
export const EXPORT_ROW_LIMIT = 10_000;

type ExportRow = Record<string, string | null>;

type ColumnKind = "text" | "date" | "number" | "days" | "longText";

// The Issues sheet's columns, in order. `date` columns are selected as
// sqlExcelTimestamp() text and written as real Excel dates; `number` columns
// are counts; `days` columns are durations in decimal days; `longText` wrap.
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
  { key: "resolution_days", header: "Resolution Time (days)", width: 22, kind: "days" },
  { key: "open_days", header: "Open For (days)", width: 17, kind: "days" },
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

const DAYS_FORMAT = "0.00";

// Seconds between two timestamps, as days
const sqlDays = (from: string, to: string) =>
  `ROUND((EXTRACT(EPOCH FROM (${to} - ${from})) / 86400)::numeric, 2)`;

// Runs the export query for a WHERE clause over issues_table `a` and counts
// every match. `exportedAt` is LOCALTIMESTAMP: the export time on the same
// clock as the issue dates, which is also what Open For counts up to.
export const fetchIssuesForExport = async (
  whereSql: string,
  params: (string | number)[],
) => {
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
      -- Reopening clears the resolved date, so a set one is the current resolution
      CASE WHEN a.issue_date_resolved IS NOT NULL
        THEN ${sqlDays("a.issue_created_at", "a.issue_date_resolved")} END AS resolution_days,
      -- Only issues still being worked on; resolved ones have Resolution Time
      CASE WHEN a.issue_status IN ('open', 'in progress')
        THEN ${sqlDays("a.issue_created_at", "LOCALTIMESTAMP")} END AS open_days,
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
  const countQuery = `
    SELECT COUNT(*) AS total, ${sqlExcelTimestamp("LOCALTIMESTAMP")} AS exported_at
    FROM issues_table a${whereSql}
  `;

  const [rows, countResult] = await Promise.all([
    query<ExportRow>(rowsQuery, [...params, EXPORT_ROW_LIMIT]),
    query<{ total: string; exported_at: string }>(countQuery, params),
  ]);

  const total = Math.max(parseInt(countResult[0]?.total || "0", 10), rows.length);
  return { rows, total, exportedAt: countResult[0]?.exported_at ?? null };
};

// Builds absolute links to an issue page (`/dashboard/<uuid>` or
// `/dashboard/analytics/<uuid>`). NEXT_PUBLIC_BASE_URL is the canonical
// origin (as in emails); without it, the origin this request came in on.
export const issueLinkBuilder = async (request: Request, pagePath: string) => {
  const origin = homeUrl ? "" : await getRequestOrigin(request);
  return (uuid: string) =>
    homeUrl ? appUrl(`${pagePath}/${uuid}`) : `${origin}${basePath}${pagePath}/${uuid}`;
};

// The Issues sheet, with each reference linking to the issue
export const addIssuesSheet = (
  workbook: Workbook,
  rows: ExportRow[],
  issueUrl: (uuid: string) => string,
) => {
  const worksheet = workbook.addWorksheet("Issues");
  worksheet.columns = COLUMNS.map(({ key, header, width, kind }) => ({
    key,
    header,
    width,
    style:
      kind === "date"
        ? { numFmt: EXCEL_DATE_FORMAT }
        : kind === "days"
          ? { numFmt: DAYS_FORMAT }
          : undefined,
  }));

  for (const row of rows) {
    const out: Record<string, unknown> = {};
    for (const { key, kind } of COLUMNS) {
      const value = row[key];
      if (kind === "date") out[key] = excelDate(value);
      else if (kind === "number") out[key] = Number(value ?? 0);
      else if (kind === "days") out[key] = value == null ? null : Number(value);
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
};

// The Filters sheet: what the file holds and how it was made. `filters` are
// the applied filters as [label, value] lines, in the filter panel's order.
export const addFiltersSheet = (
  workbook: Workbook,
  details: {
    exportedBy: string;
    exportedAt: string | null;
    view: string;
    total: number;
    rowCount: number;
    filters: [string, string][];
  },
) => {
  const { exportedBy, exportedAt, view, total, rowCount, filters } = details;

  const summary = workbook.addWorksheet("Filters");
  summary.columns = [
    { key: "label", width: 32 },
    { key: "value", width: 60 },
  ];

  // A row with only a title; styled with the other titles below
  const addSection = (title: string) => summary.addRow([title]);

  addSection("Export");
  summary.addRow(["Exported by", exportedBy]);
  const exportedAtRow = summary.addRow([
    "Exported at",
    excelDate(exportedAt) ?? new Date(),
  ]);
  exportedAtRow.getCell(2).numFmt = EXCEL_DATE_FORMAT;
  exportedAtRow.getCell(2).alignment = { horizontal: "left" };
  summary.addRow(["View", view]);
  summary.addRow(["Matching issues", total]);
  summary.addRow(["Issues in this file", rowCount]);
  if (total > rowCount) {
    const note = summary.addRow([
      "Note",
      `Only the newest ${rowCount.toLocaleString()} issues are included. Narrow the filters to export the rest.`,
    ]);
    note.getCell(2).font = { bold: true, color: { argb: "FFB91C1C" } };
  }
  summary.addRow([
    "Durations",
    "Calendar days (0.50 is 12 hours). Resolution Time runs from submission to resolution; Open For, on open and in-progress issues, runs to the export time.",
  ]);

  summary.addRow([]);
  addSection("Applied filters");
  if (filters.length === 0) {
    summary.addRow(["None", "Every issue in this view"]);
  } else {
    for (const line of filters) summary.addRow(line);
  }

  summary.getColumn("label").font = { bold: true };
  summary.getColumn("value").alignment = { wrapText: true, vertical: "top", horizontal: "left" };
  // Section titles keep their own font
  summary.eachRow((row) => {
    if (row.getCell(2).value == null && row.getCell(1).value) {
      row.font = { bold: true, size: 12 };
    }
  });
};

// The Filters sheet's value for an Agent filter, which holds an email:
// "Name (email)", or the email alone for someone who's no longer a user
export const agentFilterLabel = async (email: string) => {
  const [agent] = await query<{ username: string }>(
    "SELECT username FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
    [email],
  );
  return agent ? `${agent.username} (${email})` : email;
};

// Headers that tell the client a result was cut to the row limit
export const exportCountHeaders = (rowCount: number, total: number) => ({
  "X-Export-Rows": String(rowCount),
  "X-Export-Total": String(total),
});
