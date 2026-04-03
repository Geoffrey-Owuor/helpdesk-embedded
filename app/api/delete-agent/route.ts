import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import { revalidateTag } from "next/cache";

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

    // Check if the agent exists in our user's table
    const { rows: agentInfo } = await client.query(
      `
        SELECT user_id FROM users WHERE email = $1 AND department = $2 FOR UPDATE
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

    //Agent is there - get the agent_id, and prepare the data we will replace
    const agentId = agentInfo[0].user_id;
    const deletedRole = "deleted_agent";
    const deletedPassword = "deleted_password";

    // Replace issue types assigned to the agent being deleted to the admin performing the deletion
    await client.query(
      `
        UPDATE issues_mapping
        SET agent_id = $1
        WHERE agent_id = $2 AND admin_id = $3
        `,
      [userId, agentId, userId],
    );

    // Update the user's table with the deleted info
    const userUpdateQuery = `
     UPDATE users
     SET role = $1,
     password = $2,
     refresh_token = NULL,
     refresh_token_expiry = NULL,
     reset_token = NULL,
     is_user_active = FALSE,
     reset_token_expiry = NULL
     WHERE email = $3 AND department = $4
    `;

    const userUpdateParams = [
      deletedRole,
      deletedPassword,
      agentEmail,
      department,
    ];

    await client.query(userUpdateQuery, userUpdateParams);

    // Commit the transaction
    await client.query("COMMIT");

    // Revalidate issue cache tags
    revalidateTag("GetIssueAgents", { expire: 0 });
    revalidateTag("Issue_Types", { expire: 0 });
    revalidateTag("Issue_Agents_Mapping", { expire: 0 });

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
