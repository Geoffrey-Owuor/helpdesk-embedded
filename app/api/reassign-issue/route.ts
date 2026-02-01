import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { NextResponse } from "next/server";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";

export const PUT = withAuth(async ({ request, user }) => {
  let client: PoolClient | undefined;

  const { username, role, email, userId } = user;

  //Check if user is authorized to perform this operation
  if (role !== "admin") {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const { uuid, agentName, agentEmail } = await request.json();

    if (!uuid || !agentName || !agentEmail) {
      return NextResponse.json(
        { message: "Missing some required information" },
        { status: 400 },
      );
    }

    // get a pool client
    client = await pool.connect();

    // Begin a transaction
    await client.query("BEGIN");

    // Check if issue is already marked as resolved
    const { rows } = await client.query(
      `SELECT issue_status, issue_agent_email FROM issues_table WHERE issue_uuid = $1 FOR UPDATE`,
      [uuid],
    );

    //If nothing is returned
    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    // Our current issues status and current agent email
    const currentStatus = rows[0].issue_status;
    const currentAgentEmail = rows[0].issue_agent_email;

    // Issue is already resolved
    if (currentStatus === "resolved") {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "This issue is already marked as resolved" },
        { status: 409 },
      );
    }

    //Trying to reassign an issue to the same agent
    if (agentEmail === currentAgentEmail) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Issue is already assigned to the selected agent" },
        { status: 409 },
      );
    }

    // Otherwise let's perform our update
    const updateQuery = `
    UPDATE issues_table SET 
    issue_agent_id = NULL,
    issue_agent_name = $1,
    issue_agent_email = $2,
    issue_assigner_id = $3,
    issue_assigner_name = $4,
    issue_assigner_email = $5
    WHERE issue_uuid = $6
    `;

    // Our params
    const updateParams = [agentName, agentEmail, userId, username, email, uuid];

    // run the query
    await client.query(updateQuery, updateParams);

    // commit the transaction
    await client.query("COMMIT");

    // return a response
    return NextResponse.json(
      { message: "Issue successfully reassigned" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to reassign the issue:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
