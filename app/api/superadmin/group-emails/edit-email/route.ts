import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { NextResponse } from "next/server";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";

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
    const { id: recordId, data } = await request.json();
    const { emails, department } = data ?? {};

    if (!recordId || !emails || !department) {
      return NextResponse.json(
        { message: "Missing some required fields" },
        { status: 400 },
      );
    }

    // Get a pool client
    client = await pool.connect();

    // Begin transaction
    await client.query("BEGIN");

    // Lock the target row and check it exists
    const { rows: existingRecord } = await client.query(
      `SELECT id FROM group_emails WHERE id = $1 FOR UPDATE`,
      [recordId],
    );

    if (existingRecord.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Selected record not found" },
        { status: 404 },
      );
    }

    // Check if the new department name is already taken by a different record
    const { rows: conflictingDepartment } = await client.query(
      `SELECT id FROM group_emails WHERE LOWER(department) = LOWER($1) AND id != $2 LIMIT 1`,
      [department, recordId],
    );

    if (conflictingDepartment.length > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          message: `A record for the "${department}" department already exists`,
        },
        { status: 409 },
      );
    }

    // Perform the update
    await client.query(
      `UPDATE group_emails SET emails = $1, department = $2 WHERE id = $3`,
      [emails, department, recordId],
    );

    // Commit transaction
    await client.query("COMMIT");

    return NextResponse.json(
      { message: "Group email record updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to update group email:", error);
    return NextResponse.json(
      { message: "Error while trying to update the group email record" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
