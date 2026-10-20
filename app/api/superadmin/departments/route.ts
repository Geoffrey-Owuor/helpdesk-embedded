import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { query } from "@/lib/Db";

// Staff departments (public.departments) with how many active users belong
// to each, for the super admin departments manager
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
      SELECT d.id, d.department_name AS name, d.issue_prefix AS prefix,
      d.is_active AS "isActive",
      COUNT(u.user_id)::int AS "userCount"
      FROM public.departments AS d
      LEFT JOIN users AS u
        ON LOWER(u.department) = LOWER(d.department_name)
        AND u.is_user_active = TRUE
      GROUP BY d.id
      ORDER BY d.id ASC
    `;

    const departments = await query(baseQuery);

    return NextResponse.json(departments, { status: 200 });
  } catch (error) {
    console.error("Error while trying to get departments", error);
    return NextResponse.json([], { status: 500 });
  }
});
