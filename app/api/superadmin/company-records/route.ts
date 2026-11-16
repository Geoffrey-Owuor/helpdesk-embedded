import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { query } from "@/lib/Db";

// The staff records (public.company_user_records) for the super admin Staff
// Records modal, plus the active accounts that have no record yet. A few
// hundred rows: the modal searches and pages them client side.
export const GET = withAuth(async ({ user }) => {
  if (!user.isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const records = await query(
      `SELECT r.id, r.name, r.email, r.department,
       r.is_active AS "isActive",
       EXISTS (
         SELECT 1 FROM users AS u WHERE LOWER(u.email) = r.email
       ) AS "hasAccount",
       EXISTS (
         SELECT 1 FROM users AS u
         WHERE LOWER(u.email) = r.email AND u.is_user_active = FALSE
       ) AS "accountDeactivated",
       EXISTS (
         SELECT 1 FROM public.departments AS d
         WHERE LOWER(d.department_name) = LOWER(r.department)
       ) AS "departmentKnown"
       FROM company_user_records AS r
       ORDER BY LOWER(r.name) ASC, r.id ASC`,
    );

    // Soft-deleted accounts are inactive, so they're left out too.
    // departmentAvailable: the record can only take an active department.
    const missingAccounts = await query(
      `SELECT u.user_id AS "userId", u.username AS name,
       LOWER(TRIM(u.email)) AS email, u.department, u.role,
       COALESCE(d.is_active, FALSE) AS "departmentAvailable"
       FROM users AS u
       LEFT JOIN public.departments AS d
         ON LOWER(d.department_name) = LOWER(u.department)
       WHERE u.is_user_active = TRUE
       AND NOT EXISTS (
         SELECT 1 FROM company_user_records AS r
         WHERE r.email = LOWER(TRIM(u.email))
       )
       ORDER BY LOWER(u.username) ASC`,
    );

    return NextResponse.json({ records, missingAccounts }, { status: 200 });
  } catch (error) {
    console.error("Error while trying to get the company user records", error);
    return NextResponse.json(
      { message: "Error while trying to load the staff records" },
      { status: 500 },
    );
  }
});
