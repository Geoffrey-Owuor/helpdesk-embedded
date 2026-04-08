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
    COALESCE(m.issue_type, 'Unassigned') AS issue_type,
    COALESCE(m.issue_priority, 'None') AS issue_priority,
    COALESCE(m.id::text, gen_random_uuid()::text) AS issue_id,
    COALESCE((SELECT username FROM users WHERE user_id = m.admin_id), 'Unassigned') AS admin_name,
    COALESCE((SELECT email FROM users WHERE user_id = m.admin_id), 'Unassigned') AS admin_email
   FROM users AS agents
   LEFT JOIN issues_mapping AS m ON agents.user_id = m.agent_id
   WHERE (agents.role = 'agent' OR agents.role = 'admin') AND agents.is_user_active = TRUE
    `;

    const issuesMapping = await query(baseQuery);

    return NextResponse.json(issuesMapping, { status: 200 });
  } catch (error) {
    console.error("Error while trying to get users", error);
    return NextResponse.json([], { status: 500 });
  }
});
