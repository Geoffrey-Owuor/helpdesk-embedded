import { NextResponse } from "next/server";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import { revalidateTag } from "next/cache";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";

export const DELETE = withAuth(async ({ request, user }) => {
  let client: PoolClient | undefined;

  const { isSuper } = user;

  if (!isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "Selected id could not be found" },
      { status: 400 },
    );
  }

  // convert the id to a number
  const emailNumber = Number(id);

  if (!emailNumber) {
    return NextResponse.json(
      { message: "Could not resolve the selected id" },
      { status: 400 },
    );
  }

  try {
    // get a pool client
    client = await pool.connect();

    // Begin a transaction
    await client.query("BEGIN");

    // Check if the issue type exists
    const { rows } = await client.query(
      `
          SELECT id FROM group_emails
          WHERE id = $1 FOR UPDATE
        `,
      [emailNumber],
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Selected email not found" },
        { status: 404 },
      );
    }

    // Issue exists - we can delete it
    await client.query(
      `
        DELETE FROM group_emails WHERE id = $1
        `,
      [emailNumber],
    );

    // Commit transaction
    await client.query("COMMIT");

    // Refetch departments data
    revalidateTag("BaseDepartments_Data", { expire: 0 });

    // Return a response
    return NextResponse.json(
      { message: "Department deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to delete an email:", error);
    return NextResponse.json(
      { message: "Error while trying to delete the email" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
