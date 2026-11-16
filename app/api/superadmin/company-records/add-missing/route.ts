import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { pool } from "@/lib/Db";
import { revalidateCompanyRecords } from "@/lib/companyRecords";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Most accounts one request may turn into records
const MAX_ACCOUNTS = 500;

// Creates staff records from the selected accounts that have none. The same
// rules as the list in ../route.ts, applied again here: an active account,
// in an active department (stored in the departments table's spelling), and
// still without a record.
export const POST = withAuth(async ({ user, request }) => {
  if (!user.isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const { userIds } = await request.json();

    if (
      !Array.isArray(userIds) ||
      userIds.length === 0 ||
      userIds.length > MAX_ACCOUNTS ||
      !userIds.every((id) => typeof id === "string" && UUID.test(id))
    ) {
      return NextResponse.json(
        { message: "Select at least one account to add" },
        { status: 400 },
      );
    }

    const { rowCount } = await pool.query(
      `INSERT INTO company_user_records
       (name, email, department, updated_at, updated_by)
       SELECT TRIM(u.username), LOWER(TRIM(u.email)), d.department_name,
       NOW(), $2
       FROM users AS u
       JOIN public.departments AS d
         ON LOWER(d.department_name) = LOWER(u.department)
         AND d.is_active = TRUE
       WHERE u.user_id = ANY($1::uuid[])
       AND u.is_user_active = TRUE
       ON CONFLICT (email) DO NOTHING`,
      [userIds, user.userId],
    );

    const added = rowCount ?? 0;
    const skipped = userIds.length - added;

    if (added > 0) revalidateCompanyRecords();

    if (added === 0) {
      return NextResponse.json(
        {
          message:
            "No records were added - the selected accounts already have one or are no longer eligible",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        message: `${added} staff record${added === 1 ? "" : "s"} added${
          skipped > 0 ? `, ${skipped} skipped` : ""
        }`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while adding records from accounts:", error);
    return NextResponse.json(
      { message: "Error while trying to add the staff records" },
      { status: 500 },
    );
  }
});
