import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { query } from "@/lib/Db";
import { revalidateTag } from "next/cache";

export const POST = withAuth(async ({ user, request }) => {
  const { isSuper } = user;

  if (!isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const { emails, department } = await request.json();

    if (!emails || !department) {
      return NextResponse.json(
        { message: "Emails and department are required" },
        { status: 400 },
      );
    }

    // Check for existing department
    const existingDepartment = await query(
      `SELECT id FROM group_emails WHERE LOWER(department) = LOWER($1) LIMIT 1`,
      [department],
    );

    if (existingDepartment.length > 0) {
      return NextResponse.json(
        {
          message: `A record for the "${department}" department already exists`,
        },
        { status: 409 },
      );
    }

    await query(
      `INSERT INTO group_emails (emails, department) VALUES ($1, $2)`,
      [emails, department],
    );

    // Refetch departments data
    revalidateTag("BaseDepartments_Data", { expire: 0 });

    return NextResponse.json(
      { message: "Department added successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error while trying to add group email", error);
    return NextResponse.json(
      { message: "An error occurred while adding the group email" },
      { status: 500 },
    );
  }
});
