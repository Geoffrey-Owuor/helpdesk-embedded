import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { NextResponse } from "next/server";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import {
  accountRemovalBlocker,
  revalidateIssueAgentTags,
} from "@/lib/userAccounts";

// Activates or deactivates (disables) an account. Separate from the lock
// that too many failed sign-ins set - see unlock-user.
export const PATCH = withAuth(async ({ request, user }) => {
  let client: PoolClient | undefined;
  const { isSuper, userId: currentUserId } = user;

  if (!isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const { userId, active } = await request.json();

    if (!userId || typeof active !== "boolean") {
      return NextResponse.json(
        { message: "Missing some required fields" },
        { status: 400 },
      );
    }

    if (userId === currentUserId) {
      return NextResponse.json(
        { message: "You cannot change the status of your own account" },
        { status: 400 },
      );
    }

    // get a pool client
    client = await pool.connect();

    // Begin a transaction
    await client.query("BEGIN");

    const { rows } = await client.query(
      `SELECT email FROM users WHERE user_id = $1 FOR UPDATE`,
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
        { message: "Selected user has been deleted" },
        { status: 409 },
      );
    }

    if (!active) {
      const blocker = await accountRemovalBlocker(client, userId);

      if (blocker) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { message: `${blocker} before deactivating the account` },
          { status: 409 },
        );
      }
    }

    // Deactivating also ends the user's sessions: the refresh token is
    // revoked, so they are signed out once their access token expires
    await client.query(
      active
        ? `UPDATE users SET is_user_active = TRUE WHERE user_id = $1`
        : `UPDATE users
           SET is_user_active = FALSE,
           refresh_token = NULL,
           refresh_token_expiry = NULL
           WHERE user_id = $1`,
      [userId],
    );

    // Commit transaction
    await client.query("COMMIT");

    // Agent lists only show active users
    revalidateIssueAgentTags();

    return NextResponse.json(
      {
        message: active
          ? "User activated successfully"
          : "User deactivated successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to change a user's status:", error);
    return NextResponse.json(
      { message: "Error while trying to change the user's status" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
