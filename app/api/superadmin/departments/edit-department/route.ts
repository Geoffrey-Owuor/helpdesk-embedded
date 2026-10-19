import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import { revalidateTag } from "next/cache";
import { normalizeIssuePrefix } from "@/lib/departments";

// Changes a department's issue prefix (new issue references only - existing
// ones keep theirs) or activates / deactivates it. Departments aren't
// renamed: users, issues and issue type lookups store the name.
export const PATCH = withAuth(async ({ user, request }) => {
  let client: PoolClient | undefined;

  const { isSuper } = user;

  if (!isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const { id, prefix: rawPrefix, isActive } = await request.json();
    const prefix =
      rawPrefix === undefined ? undefined : normalizeIssuePrefix(rawPrefix);

    if (!id || (rawPrefix === undefined && typeof isActive !== "boolean")) {
      return NextResponse.json(
        { message: "Missing some required fields" },
        { status: 400 },
      );
    }

    if (prefix === null) {
      return NextResponse.json(
        { message: "The issue prefix must be 1-10 letters or digits" },
        { status: 400 },
      );
    }

    if (isActive !== undefined && typeof isActive !== "boolean") {
      return NextResponse.json(
        { message: "The selected status is not valid" },
        { status: 400 },
      );
    }

    // Get a pool client
    client = await pool.connect();

    // Begin transaction
    await client.query("BEGIN");

    const { rows } = await client.query(
      `SELECT id FROM public.departments WHERE id = $1 FOR UPDATE`,
      [id],
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Selected department not found" },
        { status: 404 },
      );
    }

    if (prefix) {
      const { rows: prefixTaken } = await client.query(
        `SELECT department_name FROM public.departments
         WHERE issue_prefix = $1 AND id <> $2 LIMIT 1`,
        [prefix, id],
      );

      if (prefixTaken.length > 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          {
            message: `The "${prefix}" prefix is already used by ${prefixTaken[0].department_name}`,
          },
          { status: 409 },
        );
      }
    }

    // Only the fields that were sent change
    await client.query(
      `UPDATE public.departments
       SET issue_prefix = COALESCE($1, issue_prefix),
       is_active = COALESCE($2, is_active)
       WHERE id = $3`,
      [prefix ?? null, isActive ?? null, id],
    );

    // Commit transaction
    await client.query("COMMIT");

    // Forms and routes read departments through this cache
    revalidateTag("Departments_Data", { expire: 0 });

    return NextResponse.json(
      { message: "Department updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to update a department:", error);
    return NextResponse.json(
      { message: "Error while trying to update the department" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
