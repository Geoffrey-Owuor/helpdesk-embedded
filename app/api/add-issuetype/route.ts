import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import {
  findActiveStaff,
  issueTypeNameTaken,
  revalidateIssueAgentTags,
} from "@/lib/userAccounts";

export const POST = withAuth(async ({ user, request }) => {
  let client: PoolClient | undefined;

  const { role, userId, department } = user;

  // Check if user is not an admin
  if (role !== "admin") {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const { issueType: rawIssueType, agentEmail, issuePriority, longName } =
      await request.json();
    const issueType =
      typeof rawIssueType === "string" ? rawIssueType.trim() : "";

    // Bad request
    if (!issueType || !agentEmail || !issuePriority) {
      return NextResponse.json(
        { message: "Missing some required info" },
        { status: 400 },
      );
    }

    // get a pool client
    client = await pool.connect();

    // Begin a transaction
    await client.query("BEGIN");

    // Conflict - check if there's already an issue-type with the sent name
    if (await issueTypeNameTaken(client, issueType)) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "An issue type with this name already exists" },
        { status: 409 },
      );
    }

    // The agent must be an active agent or admin of the admin's department
    const agent = await findActiveStaff(
      client,
      agentEmail,
      ["agent", "admin"],
      department,
    );

    if (!agent) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          message:
            "Selected agent could not be found among your department's active agents",
        },
        { status: 404 },
      );
    }

    // Everything is ok - perform the insert query. The admin adding it owns it.
    const insertQuery = `
        INSERT INTO issues_mapping(issue_type, issue_priority, admin_id, agent_id, long_name)
        VALUES
        ($1, $2, $3, $4, $5)
        `;

    // Execute the query
    await client.query(insertQuery, [
      issueType,
      issuePriority,
      userId,
      agent.userId,
      longName || issueType,
    ]);

    // Commit the transaction
    await client.query("COMMIT");

    // Revalidate the cache tags
    revalidateIssueAgentTags();

    // Return a response
    return NextResponse.json(
      { message: "Issue type added successfully" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to add an issue type:", error);
    return NextResponse.json(
      { message: "Error while trying to add the issue type" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
