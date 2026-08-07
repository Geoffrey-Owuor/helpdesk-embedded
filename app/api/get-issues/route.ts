import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import {
  buildIssuesFilter,
  parseIssuesFilterParams,
} from "@/lib/issues/buildIssuesFilter";

export const GET = withAuth(async ({ user, request }) => {
  // destructure user details
  const { userId, email, role, department, isSuper } = user;

  // Extract query parameters from the request url
  const searchParams = request.nextUrl.searchParams;
  const superAdminFilter = searchParams.get("superAdminFilter");
  const agentAdminFilter = searchParams.get("agentAdminFilter");
  const filters = parseIssuesFilterParams(searchParams);

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") || "25", 10)),
  );
  const offset = (page - 1) * pageSize;

  try {
    const baseQuery = `
      SELECT
        a.issue_uuid, a.issue_submitter_id, a.issue_reference_id,
        a.issue_submitter_name, a.issue_submitter_department,
        a.issue_target_department, a.issue_type,
        a.issue_priority, a.issue_title, a.issue_description,
        a.issue_remarks, a.issue_created_at, a.issue_updated_at, a.issue_status,
        a.issue_agent_name, a.issue_agent_email, a.issue_date_resolved,
        a.issue_date_closed,
        (SELECT COUNT(*) FROM issue_attachments b WHERE b.issue_id = a.issue_uuid) AS attachments_count,
        (SELECT COUNT(*) FROM issue_reopening c WHERE c.issue_id = a.issue_uuid) AS reopened_count,
        (SELECT COUNT(*) FROM issue_escalation d WHERE d.issue_id = a.issue_uuid) AS escalated_count,
        (SELECT COUNT(*) FROM issue_collaborators e WHERE e.issue_id = a.issue_uuid) AS collaborators_count
      FROM issues_table a
    `;

    const { whereSql, params } = buildIssuesFilter(
      { role, userId, email, department, isSuper, agentAdminFilter, superAdminFilter },
      filters,
    );

    const rowsQuery = `${baseQuery}${whereSql} ORDER BY a.issue_created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const countQuery = `SELECT COUNT(*) AS total FROM issues_table a${whereSql}`;

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
    console.error("Error retrieving issues data", error);
    return NextResponse.json(
      { message: "Error retreiving the issues data" },
      { status: 500 },
    );
  }
});
