import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { NextResponse } from "next/server";
import { query } from "@/lib/Db";
import { hashPassword } from "@/lib/Auth";

// Sets a user's password for them - for users who can't receive the reset
// link (see send-reset-link). Unlocks the account and ends its sessions, the
// same as a reset by the user.
export const PUT = withAuth(async ({ request, user }) => {
  const { isSuper, userId: currentUserId } = user;

  if (!isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const { userId, password, confirmPassword } = await request.json();

    if (!userId || !password || !confirmPassword) {
      return NextResponse.json(
        { message: "Missing some required fields" },
        { status: 400 },
      );
    }

    // Your own password goes through the change-password form, which asks
    // for the current one
    if (userId === currentUserId) {
      return NextResponse.json(
        { message: "Use the change password form for your own account" },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 },
      );
    }

    const hashedPassword = await hashPassword(password);

    const rows = await query(
      `UPDATE users
       SET password = $1,
       password_attempts = 0,
       locked_at = NULL,
       reset_token = NULL,
       reset_token_expiry = NULL,
       refresh_token = NULL,
       refresh_token_expiry = NULL
       WHERE user_id = $2 AND email NOT LIKE 'deleted\\_%'
       RETURNING user_id`,
      [hashedPassword, userId],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Selected user not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Password set successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while trying to set a user's password:", error);
    return NextResponse.json(
      { message: "Error while trying to set the password" },
      { status: 500 },
    );
  }
});
