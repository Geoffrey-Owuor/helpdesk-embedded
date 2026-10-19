import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { query } from "@/lib/Db";
import { revalidateTag } from "next/cache";
import {
  normalizeDepartmentName,
  normalizeIssuePrefix,
} from "@/lib/departments";

export const POST = withAuth(async ({ user, request }) => {
  const { isSuper } = user;

  if (!isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const name = normalizeDepartmentName(body.name);
    const prefix = normalizeIssuePrefix(body.prefix);

    if (!name || !prefix) {
      return NextResponse.json(
        {
          message:
            "A department name and an issue prefix of 1-10 letters or digits are required",
        },
        { status: 400 },
      );
    }

    // Names match case-insensitively, prefixes start issue references
    const existing = await query<{ name: string; prefix: string }>(
      `SELECT department_name AS name, issue_prefix AS prefix
       FROM public.departments
       WHERE LOWER(department_name) = LOWER($1) OR issue_prefix = $2
       LIMIT 1`,
      [name, prefix],
    );

    if (existing.length > 0) {
      return NextResponse.json(
        {
          message:
            existing[0].name.toLowerCase() === name.toLowerCase()
              ? `The "${existing[0].name}" department already exists`
              : `The "${prefix}" prefix is already used by ${existing[0].name}`,
        },
        { status: 409 },
      );
    }

    await query(
      `INSERT INTO public.departments (department_name, issue_prefix)
       VALUES ($1, $2)`,
      [name, prefix],
    );

    // Forms and routes read departments through this cache
    revalidateTag("Departments_Data", { expire: 0 });

    return NextResponse.json(
      { message: "Department added successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while trying to add a department:", error);
    return NextResponse.json(
      { message: "Error while trying to add the department" },
      { status: 500 },
    );
  }
});
