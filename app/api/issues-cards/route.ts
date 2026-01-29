import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";

export const GET = withAuth(async ({ user, request }) => {
  const { userId, role, email, department } = user;

  // Defining our query params
  const searchParams = request.nextUrl.searchParams;
  const agentAdminFilter = searchParams.get("agentAdminFilter");

  // 1. Determine the Dynamic Column & Value
  let filterColumn = "";
  let filterValue = "";

  switch (role) {
    case "admin":
      filterColumn =
        agentAdminFilter === "agentAdminFilter"
          ? "issue_submitter_id"
          : "issue_target_department";
      filterValue =
        agentAdminFilter === "agentAdminFilter" ? userId : department;
      break;
    case "agent":
      filterColumn =
        agentAdminFilter === "agentAdminFilter"
          ? "issue_submitter_id"
          : "issue_agent_email";
      filterValue = agentAdminFilter === "agentAdminFilter" ? userId : email;
      break;
    default:
      filterColumn = "issue_submitter_id";
      filterValue = userId;
      break;
  }

  // 2. Helper to run a Safe, Parameterized Query
  const runStatusQuery = (status: string) => {
    const sql = `
      SELECT COUNT(*) AS count 
      FROM issues_table 
      WHERE issue_status = $1 AND ${filterColumn} = $2
    `;

    // We pass the actual values here. Postgres handles quotes and security.
    return query(sql, [status, filterValue]);
  };

  // running the total's query
  const runTotalsQuery = () => {
    const sql = `
    SELECT COUNT(*) AS count
    FROM issues_table WHERE ${filterColumn} = $1`;

    return query(sql, [filterValue]);
  };

  try {
    // 3. Fire all 4 requests in parallel
    // We get an array of results: [ [row1], [row2], ... ]
    const results = await Promise.all([
      runTotalsQuery(),
      runStatusQuery("pending"),
      runStatusQuery("in progress"),
      runStatusQuery("resolved"),
      runStatusQuery("unfeasible"),
    ]);

    // 4. Extract data safely
    // Assuming 'query' returns an array of rows.
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
