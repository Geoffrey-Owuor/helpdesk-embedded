import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { query } from "@/lib/Db";
import { DefaultUserCounts } from "@/public/assets";

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
    SELECT 
        COUNT(*) AS totals,
        COUNT(*) FILTER (WHERE role = 'agent') AS agents,
        COUNT(*) FILTER (WHERE role = 'admin') AS admins,
        COUNT(*) FILTER (WHERE role = 'user') AS normal_users,
        COUNT(*) FILTER (WHERE is_user_active = true) AS active_users,
        COUNT(*) FILTER (WHERE is_user_active = false) AS inactive_users
    FROM users
    `;

    // execute the query
    const result = await query(baseQuery);
    const row = result[0];

    const getCount = (val: string) => parseInt(val || "0", 10);

    return NextResponse.json(
      {
        totals: getCount(row.totals),
        agents: getCount(row.agents),
        admins: getCount(row.admins),
        normalUsers: getCount(row.normal_users),
        activeUsers: getCount(row.active_users),
        inactiveUsers: getCount(row.inactive_users),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while trying to get user counts:", error);
    return NextResponse.json(DefaultUserCounts, { status: 500 });
  }
});
