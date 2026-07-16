import { pool } from "@/lib/Db";
import { NextRequest, NextResponse } from "next/server";
import { PoolClient } from "pg";

// Auto close issues submitted three days ago
export async function GET(request: NextRequest) {
  let client: PoolClient | undefined;

  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  // 1. Security Check: Ensure only your script can trigger this
  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Our base query
    const baseQuery = `
    UPDATE issues_table
    SET issue_status = $1,
    issue_date_closed = CURRENT_TIMESTAMP
    WHERE issue_status = $2
    AND issue_created_at <= NOW() - INTERVAL '3 days'
    RETURNING issue_uuid, issue_reference_id, issue_date_closed
    `;

    // get a pool client
    client = await pool.connect();

    // Begin a transaction
    await client.query("BEGIN");

    // Lock rows first
    await client.query(
      `
            SELECT issue_uuid
            FROM issues_table
            WHERE issue_status = $1
            FOR UPDATE
            `,
      ["resolved"],
    );

    // Running the query
    const { rows } = await client.query(baseQuery, ["closed", "resolved"]);

    // Commit the transaction
    await client.query("COMMIT");

    // Return the json response
    return NextResponse.json({ success: true, rows }, { status: 200 });
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("[autoclose-cron] Fatal error:", error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
