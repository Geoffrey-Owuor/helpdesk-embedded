import { NextResponse } from "next/server";
import { query } from "@/lib/Db";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";

export const PATCH = withAuth(async ({ user }) => {
  const { userId } = user;

  try {
    // update notification last viewed date
    await query(
      `
            UPDATE users SET notifications_last_viewed_at = NOW()
            WHERE user_id = $1
            `,
      [userId],
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating notification date:", error);

    return NextResponse.json({ success: false }, { status: 500 });
  }
});
