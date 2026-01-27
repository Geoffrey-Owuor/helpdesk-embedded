import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";

export const GET = withAuth(async ({ request }) => {
  // get query params from the request url
  const searchParams = request.nextUrl.searchParams;
  const department = searchParams.get("department");

  // Totals per status
  const runStatusQuery = (status: string) => {
    let sql = `SELECT COUNT(*) AS count
        FROM issues_table WHERE issue_type = 'Automation' AND issue_status = $1`;
    const params = [status];

    if (department) {
      sql += ` AND department = $2`;
      params.push(department);
    }

    return query(sql, params);
  };

  // General totals
  const runTotalsQuery = () => {
    let sql = `
    SELECT COUNT(*) AS count
    FROM issues_table WHERE issue_type = 'Automation'`;
    const params = [];

    if (department) {
      sql += ` AND department = $1`;
      params.push(department);
    }

    return query(sql, params);
  };

  try {
    // Fire all four requests in parallel
    const results = await Promise.all([
      runTotalsQuery(),
      runStatusQuery("pending"),
      runStatusQuery("in progress"),
      runStatusQuery("resolved"),
      runStatusQuery("unfeasible"),
    ]);

    // Extract the returned data
    const [totalRows, pendingRows, progressRows, resolvedRows, unfeasibleRows] =
      results;

    return NextResponse.json(
      {
        // Postgres COUNT returns a string (e.g. "5"), so we parse it to a number
        totals: parseInt(totalRows[0]?.count || "0"),
        pending: parseInt(pendingRows[0]?.count || "0"),
        inProgress: parseInt(progressRows[0]?.count || "0"),
        resolved: parseInt(resolvedRows[0]?.count || "0"),
        unfeasible: parseInt(unfeasibleRows[0]?.count || "0"),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error retrieving status counts", error);
    return NextResponse.json(
      {
        pending: 0,
        inProgress: 0,
        resolved: 0,
        unfeasible: 0,
      },
      { status: 500 },
    );
  }
});
