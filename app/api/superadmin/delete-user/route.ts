import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { NextResponse } from "next/server";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import {
  accountRemovalBlocker,
  revalidateIssueAgentTags,
  softDeleteUser,
} from "@/lib/userAccounts";

export const DELETE = withAuth(async ({ user, request }) => {
  let client: PoolClient | undefined;

  const { isSuper, userId: currentUserId } = user;

  if (!isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { message: "Selected user id could not be found" },
      { status: 400 },
    );
  }

  if (userId === currentUserId) {
    return NextResponse.json(
      { message: "You cannot delete your own account" },
      { status: 400 },
    );
  }

  try {
    // get a pool client
    client = await pool.connect();

    // Begin a transaction
    await client.query("BEGIN");

    // Check if the user exists
    const { rows } = await client.query(
      `SELECT email from users WHERE user_id = $1 FOR UPDATE`,
      [userId],
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Selected user not found" },
        { status: 404 },
      );
    }

    if (rows[0].email.startsWith("deleted_")) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Selected user is already deleted" },
        { status: 409 },
      );
    }

    // Issue types and open issues assigned to the user must be reassigned
    const blocker = await accountRemovalBlocker(client, userId);

    if (blocker) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: `${blocker} before deleting the user` },
        { status: 409 },
      );
    }

    // Everything satisfied, mark the user as deleted
    await softDeleteUser(client, userId, rows[0].email);

    // Commit transaction
    await client.query("COMMIT");

    revalidateIssueAgentTags();

    // Return a response
    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to delete a user:", error);
    return NextResponse.json(
      { message: "Error while trying to delete the user" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
