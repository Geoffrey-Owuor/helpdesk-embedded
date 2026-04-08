import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { NextResponse } from "next/server";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import { revalidateTag } from "next/cache";

export const PUT = withAuth(async ({ user, request }) => {
  let client: PoolClient | undefined;

  const { isSuper } = user;

  if (!isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const { issueId, issueType, issuePriority, agentEmail, adminEmail } =
      await request.json();

    if (
      !issueId ||
      !issueType ||
      !issuePriority ||
      !agentEmail ||
      !adminEmail
    ) {
      return NextResponse.json(
        { message: "Missing some required fields" },
        { status: 400 },
      );
    }

    //Convert the issueId to number
    const issueNumber = Number(issueId);

    if (!issueNumber) {
      return NextResponse.json(
        { message: "Could not resolve the selected issue id" },
        { status: 400 },
      );
    }

    // get a pool client
    client = await pool.connect();

    // Begin a transaction
    await client.query("BEGIN");

    // Check if the issue type exists
    const { rows } = await client.query(
      `
          SELECT id FROM issues_mapping
          WHERE id = $1 FOR UPDATE
        `,
      [issueNumber],
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Selected issue not found" },
        { status: 404 },
      );
    }

    // Get the corresponding admin id
    const { rows: adminData } = await client.query(
      `
            SELECT user_id AS admin_id
            FROM users
            WHERE email = $1 AND is_user_active = TRUE LIMIT 1
            `,
      [adminEmail],
    );

    // Get the corresponding agent id
    const { rows: agentData } = await client.query(
      `
            SELECT user_id AS agent_id
            FROM users
            WHERE email = $1 AND is_user_active = TRUE LIMIT 1
            `,
      [agentEmail],
    );

    // Admin not found
    if (adminData.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Selected admin could not be found" },
        { status: 404 },
      );
    }

    // Agent not found
    if (agentData.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Selected agent could not be found" },
        { status: 404 },
      );
    }

    // The returned data
    const adminId = adminData[0].admin_id;
    const agentId = agentData[0].agent_id;

    // The update query
    const updateQuery = `
    UPDATE issues_mapping
    SET issue_type = $1,
    admin_id = $2,
    agent_id = $3,
    issue_priority = $4
    WHERE id = $5
    `;

    const updateParams = [
      issueType,
      adminId,
      agentId,
      issuePriority,
      issueNumber,
    ];

    await client.query(updateQuery, updateParams);

    // Commit transaction
    await client.query("COMMIT");

    // Revalidate cache tags
    revalidateTag("GetIssueAgents", { expire: 0 });
    revalidateTag("Issue_Types", { expire: 0 });
    revalidateTag("Issue_Agents_Mapping", { expire: 0 });

    // Return a response
    return NextResponse.json(
      { message: "Issue updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to update an issue:", error);
    return NextResponse.json(
      { message: "Error while trying to update the issue" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
