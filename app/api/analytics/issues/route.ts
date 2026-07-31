import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import {
  buildAnalyticsIssuesFilter,
  parseAnalyticsFilterParams,
} from "@/lib/analytics/buildAnalyticsIssuesFilter";

export const GET = withAuth(async ({ user, request }) => {
  if (!user.isSuper) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const filters = parseAnalyticsFilterParams(searchParams);

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") || "25", 10)),
  );
  const offset = (page - 1) * pageSize;

  const { whereSql, params } = buildAnalyticsIssuesFilter(filters);

  try {
    const rowsQuery = `
      SELECT
        a.issue_uuid, a.issue_reference_id, a.issue_submitter_name, a.issue_submitter_department,
        a.issue_target_department, a.issue_type, a.issue_priority, a.issue_title, a.issue_status,
        a.issue_agent_name, a.issue_agent_email, a.issue_created_at, a.issue_date_resolved,
        (SELECT COUNT(*) FROM issue_attachments b WHERE b.issue_id = a.issue_uuid) AS attachments_count,
        (SELECT COUNT(*) FROM issue_reopening c WHERE c.issue_id = a.issue_uuid) AS reopened_count,
        (SELECT COUNT(*) FROM issue_escalation d WHERE d.issue_id = a.issue_uuid) AS escalated_count,
        (SELECT COUNT(*) FROM issue_collaborators e WHERE e.issue_id = a.issue_uuid) AS collaborators_count
      FROM issues_table a
      ${whereSql}
      ORDER BY a.issue_created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const countQuery = `SELECT COUNT(*) AS total FROM issues_table a ${whereSql}`;

    const [rows, countResult] = await Promise.all([
      query(rowsQuery, [...params, pageSize, offset]),
      query<{ total: string }>(countQuery, params),
    ]);

    return NextResponse.json(
      {
        rows,
        total: parseInt(countResult[0]?.total || "0", 10),
        page,
        pageSize,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error retrieving analytics issues data", error);
    return NextResponse.json(
      { message: "Error retrieving the analytics issues data" },
      { status: 500 },
    );
  }
});
