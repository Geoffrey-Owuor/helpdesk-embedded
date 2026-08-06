import { NextResponse } from "next/server";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
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
  const grantNumber = Number(id);

  if (!grantNumber) {
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

    // Check if the grant exists
    const { rows } = await client.query(
      `
          SELECT id FROM special_access
          WHERE id = $1 FOR UPDATE
        `,
      [grantNumber],
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Selected access grant not found" },
        { status: 404 },
      );
    }

    // Grant exists - we can delete it
    await client.query(
      `
        DELETE FROM special_access WHERE id = $1
        `,
      [grantNumber],
    );

    // Commit transaction
    await client.query("COMMIT");

    // Return a response
    return NextResponse.json(
      { message: "Access revoked successfully" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to revoke special access:", error);
    return NextResponse.json(
      { message: "Error while trying to revoke access" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
