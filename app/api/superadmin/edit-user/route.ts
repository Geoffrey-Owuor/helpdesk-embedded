import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { NextResponse } from "next/server";
import { pool } from "@/lib/Db";
import {
  INVALID_DEPARTMENT_MESSAGE,
  resolveDepartmentName,
} from "@/lib/departments";
import { PoolClient } from "pg";
import {
  countIssueMappings,
  isUserRole,
  revalidateIssueAgentTags,
} from "@/lib/userAccounts";

// Edits a user's profile (name, email, department, role). Status, lock and
// password have their own routes: user-status, unlock-user, set-password
// and send-reset-link.
export const PUT = withAuth(async ({ request, user }) => {
  let client: PoolClient | undefined;
  const { isSuper } = user;

  if (!isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const { userId, name, email, role, department } = await request.json();

    // Check if all fields have a value
    if (!userId || !name || !email || !role || !department) {
      return NextResponse.json(
        { message: "Missing some required fields" },
        { status: 400 },
      );
    }

    if (!isUserRole(role)) {
      return NextResponse.json(
        { message: "The selected role is not valid" },
        { status: 400 },
      );
    }

    // get a pool client
    client = await pool.connect();

    // Begin a transaction
    await client.query("BEGIN");

    // Check if the user exists
    const { rows } = await client.query(
      `SELECT email, department, role from users WHERE user_id = $1 FOR UPDATE`,
      [userId],
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Selected user not found" },
        { status: 404 },
      );
    }

    const current = rows[0];

    // Only an active department - or the one the user already has, even if
    // it has been made inactive since
    const departmentName = await resolveDepartmentName(
      department,
      current.department,
    );

    if (!departmentName) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: INVALID_DEPARTMENT_MESSAGE },
        { status: 400 },
      );
    }

    // The email must not belong to another account
    const { rows: emailTaken } = await client.query(
      `SELECT user_id FROM users WHERE LOWER(email) = LOWER($1) AND user_id <> $2 LIMIT 1`,
      [email, userId],
    );

    if (emailTaken.length > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 },
      );
    }

    // Issue types route by the agent's and admin's department and need an
    // agent or admin, so moving or demoting one of them waits until their
    // issue types are reassigned. Name and email changes don't.
    const leavesIssueTypes =
      departmentName !== current.department ||
      (role === "user" && current.role !== "user");

    if (leavesIssueTypes && (await countIssueMappings(client, userId)) > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          message:
            "Selected user is the agent or admin of some issue types, reassign them before changing the user's department or making them a user",
        },
        { status: 409 },
      );
    }

    // Update query
    const updateQuery = `
    UPDATE users
    SET email = $1,
    username = $2,
    role = $3,
    department = $4
    WHERE user_id = $5
    `;

    // The update params
    const updateParams = [email, name, role, departmentName, userId];

    // Running the query
    await client.query(updateQuery, updateParams);

    // Commit transaction
    await client.query("COMMIT");

    // Agent lists show names, emails and roles
    revalidateIssueAgentTags();

    // Return a response
    return NextResponse.json(
      { message: "User edited successfully", department: departmentName },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to edit a user:", error);
    return NextResponse.json(
      { message: "Error while trying to edit the user" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
