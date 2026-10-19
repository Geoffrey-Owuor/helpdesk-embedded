import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { NextResponse } from "next/server";
import { query } from "@/lib/Db";

// Clears the lock that too many failed sign-ins set (users.locked_at),
// keeping the user's password
export const PATCH = withAuth(async ({ request, user }) => {
  const { isSuper } = user;

  if (!isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { message: "Selected user id could not be found" },
        { status: 400 },
      );
    }

    const rows = await query(
      `UPDATE users
       SET locked_at = NULL, password_attempts = 0
       WHERE user_id = $1
       RETURNING user_id`,
      [userId],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Selected user not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "User unlocked successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while trying to unlock a user:", error);
    return NextResponse.json(
      { message: "Error while trying to unlock the user" },
      { status: 500 },
    );
  }
});
