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
      SELECT sa.id, sa.user_id, u.username, u.email, sa.feature, sa.granted_at
      FROM special_access sa
      JOIN users u ON u.user_id = sa.user_id
      ORDER BY sa.granted_at DESC
    `;

    const specialAccess = await query(baseQuery);

    return NextResponse.json(specialAccess, { status: 200 });
  } catch (error) {
    console.error("Error while trying to get special access grants", error);
    return NextResponse.json([], { status: 500 });
  }
});
