import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { NextResponse } from "next/server";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import { revalidateTag } from "next/cache";

export const DELETE = withAuth(async ({ user, request }) => {
  let client: PoolClient | undefined;

  const { isSuper } = user;

  if (!isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const issueId = searchParams.get("issueId");

  if (!issueId) {
    return NextResponse.json(
      { message: "Selected issue id could not be found" },
      { status: 400 },
    );
  }

  // convert the id to a number
  const issueNumber = Number(issueId);

  if (!issueNumber) {
    return NextResponse.json(
      { message: "Could not resolve the selected issue id" },
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
          SELECT id FROM issues_mapping
          WHERE id = $1 FOR UPDATE
        `,
      [issueNumber],
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Selected issue not found" },
        { status: 404 },
      );
    }

    // Issue exists - we can delete it
    await client.query(
      `
        DELETE FROM issues_mapping WHERE id = $1
        `,
      [issueNumber],
    );

    // Commit transaction
    await client.query("COMMIT");

    // Revalidate cache tags
    revalidateTag("GetIssueAgents", { expire: 0 });
    revalidateTag("Issue_Types", { expire: 0 });
    revalidateTag("Issue_Agents_Mapping", { expire: 0 });

    // Return a response
    return NextResponse.json(
      { message: "Issue deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to delete an issue:", error);
    return NextResponse.json(
      { message: "Error while trying to delete the issue" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
