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
      `SELECT issue_status, issue_reference_id, issue_agent_id, 
       issue_updated_at, issue_description, issue_agent_name, issue_agent_email 
       FROM issues_table 
       WHERE issue_uuid = $1 FOR UPDATE`,
      [uuid],
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    //our current issue status
    const currentStatus = rows[0].issue_status;
    const referenceNumber = rows[0].issue_reference_id;

    // Current assigned agent information
    const currentAgentEmail = rows[0].issue_agent_email;
    const currentAgentName = rows[0].issue_agent_name;
    const currentAgentId = rows[0].issue_agent_id;
    const currentAgentDate = rows[0].issue_updated_at;
    const currentAgentReason = rows[0].issue_description;

    // Issue is already closed
    if (currentStatus === "closed") {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "This issue is already marked as closed" },
        { status: 409 },
      );
    }

    // Check if there's escalation history for this particular issue
    const { rows: existingHistory } = await client.query(
      `
      SELECT id FROM issue_escalation WHERE issue_id = $1
      `,
      [uuid],
    );

    if (existingHistory.length === 0) {
      await client.query(
        `
        INSERT INTO issue_escalation
        (issue_id, issue_escalation_reason, issue_escalator_id, issue_escalator_email, 
        issue_escalator_name, issue_escalation_date, issue_escalated_agent_name,
        issue_escalated_agent_email, issue_escalated_agent_id)
        VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        [
          uuid,
          currentAgentReason,
          currentAgentId,
          currentAgentEmail,
          currentAgentName,
          currentAgentDate,
          currentAgentName,
          currentAgentEmail,
          currentAgentId,
        ],
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

    // Insert the new escalation history
    await client.query(
      `
      INSERT INTO issue_escalation
        (issue_id, issue_escalation_reason, issue_escalator_id, issue_escalator_email, 
        issue_escalator_name, issue_escalation_date, issue_escalated_agent_name,
        issue_escalated_agent_email, issue_escalated_agent_id)
        VALUES
        ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, $7, $8)
      `,
      [uuid, reason, userId, email, username, agentName, agentEmail, agentId],
    );

    // Our baseQuery
    const baseQuery = `
    UPDATE issues_table SET
    issue_updated_at = CURRENT_TIMESTAMP,
    issue_agent_id = $1,
    issue_agent_name = $2,
    issue_agent_email = $3
    WHERE issue_uuid = $4
    `;

    // Our params
    const baseParams = [agentId, agentName, agentEmail, uuid];

    // Run the query
    await client.query(baseQuery, baseParams);

    // Commit the transaction
    await client.query("COMMIT");

    // EMAIL SERVICE
    const title = `Issue ${referenceNumber} Escalated to ${agentName}`;
    const description = `Issue ${referenceNumber} has been escalated to ${agentName} by ${username}`;
    const reasonEscalated = reason;

    // Fire and forget - Calling the email sender service
    emailSender({ title, description, uuid, reasonEscalated });

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
