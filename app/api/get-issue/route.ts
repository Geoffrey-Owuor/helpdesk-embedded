import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { buildIssuesVisibilityClause } from "@/lib/issues/buildIssuesFilter";

export const GET = withAuth(async ({ user, request }) => {
  const { userId, email, role, department, isSuper } = user;

  const searchParams = request.nextUrl.searchParams;
  const uuid = searchParams.get("uuid");
  const agentAdminFilter = searchParams.get("agentAdminFilter");
  const superAdminFilter = searchParams.get("superAdminFilter");

  if (!uuid) {
    return NextResponse.json({ message: "Missing uuid" }, { status: 400 });
  }

  try {
    const baseQuery = `
      SELECT
        a.issue_uuid, a.issue_reference_id, a.issue_submitter_id, a.issue_submitter_name,
        a.issue_submitter_email, a.issue_submitter_department, a.issue_target_department,
        a.issue_type, a.issue_title, a.issue_description, a.issue_status, a.issue_priority,
        a.issue_remarks, a.issue_agent_name, a.issue_agent_email, a.issue_assigner_name,
        a.issue_assigner_email, a.issue_created_at, a.issue_updated_at, a.issue_date_resolved,
        a.issue_date_closed,
        (SELECT COUNT(*) FROM issue_attachments b WHERE b.issue_id = a.issue_uuid) AS attachments_count,
        (SELECT COUNT(*) FROM issue_reopening c WHERE c.issue_id = a.issue_uuid) AS reopened_count,
        (SELECT COUNT(*) FROM issue_escalation d WHERE d.issue_id = a.issue_uuid) AS escalated_count,
        (SELECT COUNT(*) FROM issue_collaborators e WHERE e.issue_id = a.issue_uuid) AS collaborators_count
      FROM issues_table a
    `;

    // uuid is always $1; visibility params (if any) continue from $2
    const { clause: visibilityClause, params: visibilityParams } =
      buildIssuesVisibilityClause(
        { role, userId, email, department, isSuper, agentAdminFilter, superAdminFilter },
        "a",
        2,
      );

    const whereParts = ["a.issue_uuid = $1", ...(visibilityClause ? [visibilityClause] : [])];
    const params = [uuid, ...visibilityParams];

    const result = await query(
      `${baseQuery} WHERE ${whereParts.join(" AND ")}`,
      params,
    );

    if (result.length === 0) {
      // Collapse "doesn't exist" and "exists but not visible to you" into one
      // response so we don't leak which uuids exist to unauthorized viewers.
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json(result[0], { status: 200 });
  } catch (error) {
    console.error("Error retrieving issue data", error);
    return NextResponse.json(
      { message: "Error retrieving the issue data" },
      { status: 500 },
    );
  }
});
