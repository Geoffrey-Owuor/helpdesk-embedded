import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { NextResponse } from "next/server";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import { emailSender } from "@/services/EmailSender";

export const PUT = withAuth(async ({ request, user }) => {
  const { username, userId, email } = user;
  let client: PoolClient | undefined;

  try {
    const { uuid, reason, agentName, agentEmail } = await request.json();

    if (!uuid || !reason || !agentName || !agentEmail) {
      return NextResponse.json(
        { message: "Missing some required fields" },
        { status: 400 },
      );
    }

    // get a pool client
    client = await pool.connect();

    // Begin a transaction
    await client.query("BEGIN");

    // Check if the issue is marked as closed
    const { rows } = await client.query(
      `SELECT issue_status, issue_reference_id, issue_agent_email FROM issues_table WHERE issue_uuid = $1 FOR UPDATE`,
      [uuid],
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    //our current issue status
    const currentStatus = rows[0].issue_status;
    const referenceNumber = rows[0].issue_reference_id;
    const currentAgentEmail = rows[0].issue_agent_email;

    // Issue is already closed
    if (currentStatus === "closed") {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "This issue is already marked as closed" },
        { status: 409 },
      );
    }

    //Trying to reassign an issue to the same agent (Feature add: Return a response with the agent name)
    if (agentEmail === currentAgentEmail) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: `Issue is already assigned to ${agentName}` },
        { status: 409 },
      );
    }

    // Get the agent id who this issue is being escalated to
    const { rows: agentInfo } = await client.query(
      `SELECT user_id FROM users WHERE email = $1`,
      [agentEmail],
    );

    if (agentInfo.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: `Selected agent: ${agentName} not found` },
        { status: 404 },
      );
    }

    // Get the returned agent id
    const agentId = agentInfo[0].user_id;

    // Our baseQuery
    const baseQuery = `
    UPDATE issues_table
    SET issue_escalated = $1,
    issue_escalation_reason = $2,
    issue_updated_at = CURRENT_TIMESTAMP,
    issue_escalation_date = CURRENT_TIMESTAMP,
    issue_escalator_id = $3,
    issue_escalator_email = $4,
    issue_escalator_name = $5,
    issue_agent_id = $6,
    issue_agent_name = $7,
    issue_agent_email = $8,
    WHERE issue_uuid = $9
    `;

    // Our params
    const baseParams = [
      "Yes",
      reason,
      userId,
      email,
      username,
      agentId,
      agentName,
      agentEmail,
      uuid,
    ];

    // Run the query
    await client.query(baseQuery, baseParams);

    // Commit the transaction
    await client.query("COMMIT");

    // EMAIL SERVICE
    const title = `Issue ${referenceNumber} Escalated to ${agentName}`;
    const description = `Issue ${referenceNumber} has been escalated to ${agentName} by ${username}`;

    // Fire and forget - Calling the email sender service
    // emailSender({ title, description, uuid });

    // return a response
    return NextResponse.json(
      { message: `Issue successfully escalated to ${agentName}` },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to escalate this issue:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
