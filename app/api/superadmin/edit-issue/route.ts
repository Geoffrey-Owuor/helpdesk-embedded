import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { NextResponse } from "next/server";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import {
  findActiveStaff,
  issueTypeNameTaken,
  renameIssueTypeOnIssues,
  revalidateIssueAgentTags,
} from "@/lib/userAccounts";

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
    const {
      issueId,
      issueType: rawIssueType,
      issuePriority,
      agentEmail,
      adminEmail,
      longName,
    } = await request.json();
    const issueType =
      typeof rawIssueType === "string" ? rawIssueType.trim() : "";

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

    // Check if the issue type exists - with its current name and the
    // department it serves, for renaming the issues raised under it
    const { rows } = await client.query(
      `
          SELECT m.id, m.issue_type, admins.department
          FROM issues_mapping AS m
          JOIN users AS admins ON admins.user_id = m.admin_id
          WHERE m.id = $1 FOR UPDATE OF m
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

    // A rename must not clash with another issue type
    if (await issueTypeNameTaken(client, issueType, issueNumber)) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "An issue type already exists with the same name" },
        { status: 409 },
      );
    }

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

    // The returned data
    const adminId = admin.userId;
    const agentId = agent.userId;

    // The update query
    const updateQuery = `
    UPDATE issues_mapping
    SET issue_type = $1,
    admin_id = $2,
    agent_id = $3,
    issue_priority = $4,
    long_name = $5
    WHERE id = $6
    `;

    const updateParams = [
      issueType,
      adminId,
      agentId,
      issuePriority,
      longName || issueType,
      issueNumber,
    ];

    await client.query(updateQuery, updateParams);

    // Issues raised under the old name follow the rename
    await renameIssueTypeOnIssues(
      client,
      rows[0].issue_type,
      issueType,
      rows[0].department,
    );

    // Commit transaction
    await client.query("COMMIT");

    // Revalidate cache tags
    revalidateIssueAgentTags();

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
