import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";

export const GET = withAuth(async ({ user, request }) => {
  const { userId, role, email, department } = user;
  const searchParams = request.nextUrl.searchParams;
  const agentAdminFilter = searchParams.get("agentAdminFilter");

  // 1. Determine Dynamic Column & Value (Same as before)
  let filterColumn = "issue_submitter_id";
  let filterValue = userId;

  switch (role) {
    case "admin":
      if (agentAdminFilter !== "agentAdminFilter") {
        filterColumn = "issue_target_department";
        filterValue = department;
      }
      break;
    case "agent":
      if (agentAdminFilter !== "agentAdminFilter") {
        filterColumn = "issue_agent_email";
        filterValue = email;
      }
      break;
  }

  // 2. The Optimized Query: "The Pivot"
  // We scan the table ONCE. As we look at each row, we decide which "bucket" it counts towards.
  const sql = `
    SELECT 
      COUNT(*) AS totals,
      COUNT(*) FILTER (WHERE issue_status = 'pending') AS pending,
      COUNT(*) FILTER (WHERE issue_status = 'in progress') AS in_progress,
      COUNT(*) FILTER (WHERE issue_status = 'resolved') AS resolved,
      COUNT(*) FILTER (WHERE issue_status = 'unfeasible') AS unfeasible
    FROM issues_table 
    WHERE ${filterColumn} = $1
  `;

  try {
    // 3. Execute ONE query
    const result = await query(sql, [filterValue]);
    const row = result[0]; // We expect exactly one row with 5 columns

    // 4. Return Data
    return NextResponse.json(
      {
        totals: parseInt(row?.totals || "0"),
        pending: parseInt(row?.pending || "0"),
        inProgress: parseInt(row?.in_progress || "0"), // Note DB snake_case match
        resolved: parseInt(row?.resolved || "0"),
        unfeasible: parseInt(row?.unfeasible || "0"),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error retrieving status counts", error);
    return NextResponse.json(
      { totals: 0, pending: 0, inProgress: 0, resolved: 0, unfeasible: 0 },
      { status: 500 },
    );
  }
});
