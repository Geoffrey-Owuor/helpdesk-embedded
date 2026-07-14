import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { query } from "@/lib/Db";

export const GET = withAuth(async ({ user }) => {
  const { isSuper } = user;

  if (!isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const baseQuery = `
    SELECT user_id, username, email, department, role, is_user_active, created_at
    FROM users ORDER BY created_at DESC
    `;

    const users = await query(baseQuery);

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error while trying to get users", error);
    return NextResponse.json([], { status: 500 });
  }
});
