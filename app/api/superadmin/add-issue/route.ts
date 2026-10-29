import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import {
  findActiveStaff,
  issueTypeNameTaken,
  revalidateIssueAgentTags,
} from "@/lib/userAccounts";

export const POST = withAuth(async ({ request, user }) => {
  let client: PoolClient | undefined;

  const { isSuper } = user;

  if (!isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const {
      issueType: rawIssueType,
      issuePriority,
      agentEmail,
      adminEmail,
      longName,
      isChangeRequest,
    } = await request.json();
    const issueType =
      typeof rawIssueType === "string" ? rawIssueType.trim() : "";

    if (!issueType || !issuePriority || !agentEmail || !adminEmail) {
      return NextResponse.json(
        { message: "Missing some required fields" },
        { status: 400 },
      );
    }

    // get a pool client
    client = await pool.connect();

    // Begin a transaction
    await client.query("BEGIN");

    // The admin must hold the admin role - their department is the one the
    // issue type is offered to
    const admin = await findActiveStaff(client, adminEmail, ["admin"]);

    if (!admin) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Selected admin could not be found among active admins" },
        { status: 404 },
      );
    }

    // The agent must be an agent or admin of the same department
    const agent = await findActiveStaff(
      client,
      agentEmail,
      ["agent", "admin"],
      admin.department,
    );

    if (!agent) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          message: `Selected agent could not be found among the ${admin.department} department's active agents`,
        },
        { status: 404 },
      );
    }

    // Selected issue type already exists in the issues database
    if (await issueTypeNameTaken(client, issueType)) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "An issue type already exists with the same name" },
        { status: 409 },
      );
    }

    // Insert Query
    const insertQuery = `
    INSERT INTO issues_mapping(issue_type, admin_id, agent_id, issue_priority, long_name, is_change_request)
    VALUES ($1, $2, $3, $4, $5, $6)
    `;

    const insertParams = [
      issueType,
      admin.userId,
      agent.userId,
      issuePriority,
      longName || issueType,
      isChangeRequest === true,
    ];

    await client.query(insertQuery, insertParams);

    // Commit transaction
    await client.query("COMMIT");

    // Revalidate the cache tags
    revalidateIssueAgentTags();

    // Success Response
    return NextResponse.json(
      { message: "Issue type added successfully" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to add an issuetype:", error);
    return NextResponse.json(
      { message: "Error while trying to add the issue type" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
