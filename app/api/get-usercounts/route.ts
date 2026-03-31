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
        COUNT(*) FILTER (WHERE role = 'agent' AND is_user_active = true) AS agents_active,
        COUNT(*) FILTER (WHERE role = 'agent' AND is_user_active = false) AS agents_inactive,
      
        COUNT(*) FILTER (WHERE role = 'admin') AS admins,
        COUNT(*) FILTER (WHERE role = 'admin' AND is_user_active = true) AS admins_active,
        COUNT(*) FILTER (WHERE role = 'admin' AND is_user_active = false) AS admins_inactive,

        COUNT(*) FILTER (WHERE role = 'user') AS normal_users,
        COUNT(*) FILTER (WHERE role = 'user' AND is_user_active = true) AS normal_users_active,
        COUNT(*) FILTER (WHERE role = 'user' AND is_user_active = false) AS normal_users_inactive

    FROM users
    `;

    // execute the query
    const result = await query(baseQuery);
    const row = result[0];

    const getCount = (val: string) => parseInt(val || "0", 10);

    return NextResponse.json(
      {
        totals: getCount(row.totals),
        agents: {
          total: getCount(row.agents),
          active: getCount(row.agents_active),
          inactive: getCount(row.agents_inactive),
        },
        admins: {
          total: getCount(row.admins),
          active: getCount(row.admins_active),
          inactive: getCount(row.admins_inactive),
        },
        normalUsers: {
          total: getCount(row.normal_users),
          active: getCount(row.normal_users_active),
          inactive: getCount(row.normal_users_inactive),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while trying to get user counts:", error);
    return NextResponse.json(DefaultUserCounts, { status: 500 });
  }
});
