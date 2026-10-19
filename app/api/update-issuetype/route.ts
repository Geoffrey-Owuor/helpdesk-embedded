import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import {
  findActiveStaff,
  issueTypeNameTaken,
  renameIssueTypeOnIssues,
  revalidateIssueAgentTags,
} from "@/lib/userAccounts";

export const PUT = withAuth(async ({ request, user }) => {
  let client: PoolClient | undefined;

  const { role, department } = user;

  // Make sure the user running the query is an admin
  if (role !== "admin") {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const {
      selectedType: rawSelectedType,
      selectedEmail,
      issueType,
      selectedPriority,
      longName,
    } = await request.json();
    // The new name; issueType is the current one
    const selectedType =
      typeof rawSelectedType === "string" ? rawSelectedType.trim() : "";

    if (!selectedType || !selectedEmail || !issueType || !selectedPriority) {
      return NextResponse.json(
        { message: "Missing some required payload information" },
        { status: 400 },
      );
    }

    // get a pool client
    client = await pool.connect();

    // Begin a transaction
    await client.query("BEGIN");

    // Check if the issue type exists and belongs to the admin's department
    const { rows } = await client.query(
      `SELECT m.id, m.issue_type FROM issues_mapping AS m
       JOIN users AS admins ON admins.user_id = m.admin_id
       WHERE m.issue_type = $1 AND admins.department = $2
       FOR UPDATE OF m`,
      [issueType, department],
    );

    // Issue type does not exist
    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Issue type not found in your department" },
        { status: 404 },
      );
    }

    const mappingId = rows[0].id;

    // A rename must not clash with another issue type
    if (await issueTypeNameTaken(client, selectedType, mappingId)) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "An issue type with this name already exists" },
        { status: 409 },
      );
    }

    // The agent must be an active agent or admin of the admin's department
    const agent = await findActiveStaff(
      client,
      selectedEmail,
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

    // Issue type exists - we can update it
    const updateQuery = `
       UPDATE issues_mapping
       SET issue_type = $1,
       issue_priority = $2,
       agent_id = $3,
       long_name = $4
       WHERE id = $5
    `;

    // Run the query
    await client.query(updateQuery, [
      selectedType,
      selectedPriority,
      agent.userId,
      longName || selectedType,
      mappingId,
    ]);

    // Issues raised under the old name follow the rename
    await renameIssueTypeOnIssues(
      client,
      rows[0].issue_type,
      selectedType,
      department,
    );

    // Commit the transaction
    await client.query("COMMIT");

    // Revalidate the cache tags
    revalidateIssueAgentTags();

    // return a response
    return NextResponse.json(
      { message: "Issue type info updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to update issue type info:", error);
    return NextResponse.json(
      { message: "Error updating issue type info" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
