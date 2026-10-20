import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import {
  countOpenAssignedIssues,
  revalidateIssueAgentTags,
  softDeleteUser,
} from "@/lib/userAccounts";

export const DELETE = withAuth(async ({ user, request }) => {
  let client: PoolClient | undefined;

  const { role, department, userId } = user;

  // User must be an admin
  if (role !== "admin") {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();

    const { agentEmail } = body;

    // No agent email provided
    if (!agentEmail) {
      return NextResponse.json(
        { message: "Missing required agent email payload" },
        { status: 400 },
      );
    }

    // get a pool client
    client = await pool.connect();

    // Begin a transaction
    await client.query("BEGIN");

    // Check if the agent exists in the admin's department
    const { rows: agentInfo } = await client.query(
      `
        SELECT user_id, email, role FROM users
        WHERE email = $1 AND department = $2 AND is_user_active = TRUE
        FOR UPDATE
        `,
      [agentEmail, department],
    );

    if (agentInfo.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Selected agent not found, probably already deleted" },
        { status: 404 },
      );
    }

    // Admins can delete agents only - not other admins, users or themselves
    // (a super admin manages those)
    if (agentInfo[0].role !== "agent" || agentInfo[0].user_id === userId) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          message:
            "Only agents can be deleted here, contact a super admin to remove an admin",
        },
        { status: 403 },
      );
    }

    const agentId = agentInfo[0].user_id;

    // Open issues assigned to the agent would be stranded
    const openIssues = await countOpenAssignedIssues(client, agentId);

    if (openIssues > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          message: `The agent has ${openIssues} open issue${openIssues === 1 ? "" : "s"} assigned, reassign ${openIssues === 1 ? "it" : "them"} before deleting the agent`,
        },
        { status: 409 },
      );
    }

    // Hand the agent's issue types to the admin performing the deletion -
    // including ones that recorded the agent as their admin too
    await client.query(
      `
        UPDATE issues_mapping
        SET agent_id = CASE WHEN agent_id = $2 THEN $1 ELSE agent_id END,
        admin_id = CASE WHEN admin_id = $2 THEN $1 ELSE admin_id END
        WHERE $2 IN (agent_id, admin_id)
        `,
      [userId, agentId],
    );

    // Mark the agent as deleted
    await softDeleteUser(client, agentId, agentInfo[0].email);

    // Commit the transaction
    await client.query("COMMIT");

    // Revalidate issue cache tags
    revalidateIssueAgentTags();

    // Return a response
    return NextResponse.json(
      { message: "Agent deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to delete an agent:", error);
    return NextResponse.json(
      { message: "Error while trying to delete the agent" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
