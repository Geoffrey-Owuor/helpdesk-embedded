import { NextResponse } from "next/server";
import { query } from "@/lib/Db";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";

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
        agents.username AS agent_name,
        agents.email AS agent_email,
        admins.username AS admin_name,
        admins.email AS admin_email,
        m.id AS issue_id,
        m.issue_type AS issue_type,
        m.issue_priority AS issue_priority
        FROM issues_mapping AS m
        JOIN users AS agents ON m.agent_id = agents.user_id
        JOIN users AS admins ON m.admin_id = admins.user_id
    `;

    const issuesMapping = await query(baseQuery);

    return NextResponse.json(issuesMapping, { status: 200 });
  } catch (error) {
    console.error("Error while trying to get users", error);
    return NextResponse.json([], { status: 500 });
  }
});
