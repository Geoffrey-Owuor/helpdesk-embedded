import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { query } from "@/lib/Db";
import {
  INVALID_DEPARTMENT_MESSAGE,
  resolveDepartmentName,
} from "@/lib/departments";
import {
  normalizeRecordEmail,
  normalizeRecordName,
  revalidateCompanyRecords,
} from "@/lib/companyRecords";

export const POST = withAuth(async ({ user, request }) => {
  if (!user.isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const name = normalizeRecordName(body.name);
    const email = normalizeRecordEmail(body.email);

    if (!name || !email) {
      return NextResponse.json(
        { message: "A name and a valid email address are required" },
        { status: 400 },
      );
    }

    // Only an active department, stored in the departments table's spelling
    const department = await resolveDepartmentName(body.department);

    if (!department) {
      return NextResponse.json(
        { message: INVALID_DEPARTMENT_MESSAGE },
        { status: 400 },
      );
    }

    // The unique email constraint settles a race between two admins
    const inserted = await query(
      `INSERT INTO company_user_records
       (name, email, department, updated_at, updated_by)
       VALUES ($1, $2, $3, NOW(), $4)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [name, email, department, user.userId],
    );

    if (inserted.length === 0) {
      const existing = await query<{ is_active: boolean }>(
        `SELECT is_active FROM company_user_records WHERE email = $1`,
        [email],
      );
      return NextResponse.json(
        {
          message:
            existing[0]?.is_active === false
              ? "A deactivated record with this email already exists, activate it instead"
              : "A record with this email already exists",
        },
        { status: 409 },
      );
    }

    revalidateCompanyRecords();

    return NextResponse.json(
      { message: "Staff record added successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while trying to add a company user record:", error);
    return NextResponse.json(
      { message: "Error while trying to add the staff record" },
      { status: 500 },
    );
  }
});
