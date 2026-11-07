import { NextResponse } from "next/server";
import { query } from "@/lib/Db";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { buildIssuesVisibilityClause } from "@/lib/issues/buildIssuesFilter";

export interface IssueAgentOption {
  agent_name: string;
  agent_email: string;
  // Their staff department now; empty when they're no longer a user
  department: string;
}

// The agents and collaborators on the issues this user can see, for the
// issues list's Agent filter. Built from the issues rather than the users
// table, so agents who have since been deactivated stay filterable and the
// list only holds people who appear in this view.
export const GET = withAuth(async ({ request, user }) => {
  const { role, department, userId, email, isSuper } = user;
  const searchParams = request.nextUrl.searchParams;

  const { clause, params } = buildIssuesVisibilityClause({
    role,
    userId,
    email,
    department,
    isSuper,
    agentAdminFilter: searchParams.get("agentAdminFilter"),
    superAdminFilter: searchParams.get("superAdminFilter"),
  });

  try {
    const agents = await query<IssueAgentOption>(
      `
      WITH visible AS (
        SELECT a.issue_uuid, a.issue_agent_email, a.issue_agent_name
        FROM issues_table a
        ${clause ? `WHERE ${clause}` : ""}
      ),
      people AS (
        SELECT issue_agent_email AS email, issue_agent_name AS name FROM visible
        WHERE issue_agent_email IS NOT NULL AND issue_agent_email <> ''
        UNION ALL
        SELECT c.collaborator_email, c.collaborator_name
        FROM issue_collaborators c JOIN visible v ON v.issue_uuid = c.issue_id
      )
      SELECT
        LOWER(p.email) AS agent_email,
        COALESCE(MAX(u.username), MAX(p.name)) AS agent_name,
        COALESCE(MAX(u.department), '') AS department
      FROM people p
      LEFT JOIN users u ON LOWER(u.email) = LOWER(p.email)
      GROUP BY LOWER(p.email)
      ORDER BY department, agent_name
      `,
      params,
    );
    return NextResponse.json(agents, { status: 200 });
  } catch (error) {
    console.error("Error retrieving the issues' agents", error);
    return NextResponse.json(
      { message: "Error retrieving the agents list" },
      { status: 500 },
    );
  }
});
