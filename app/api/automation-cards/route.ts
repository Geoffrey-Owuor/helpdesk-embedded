import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";

export const GET = withAuth(async ({ request }) => {
  const searchParams = request.nextUrl.searchParams;
  const department = searchParams.get("department");
  const issueTypeFilter = "Automation";

  // 1. Prepare Dynamic SQL
  // We start with the base requirement: filter by issue_type.
  // We will append the department filter only if it exists.
  let sql = `
    SELECT 
      COUNT(*) AS totals,
      COUNT(*) FILTER (WHERE issue_status = 'pending') AS pending,
      COUNT(*) FILTER (WHERE issue_status = 'in progress') AS in_progress,
      COUNT(*) FILTER (WHERE issue_status = 'resolved') AS resolved,
      COUNT(*) FILTER (WHERE issue_status = 'unfeasible') AS unfeasible
    FROM issues_table 
    WHERE issue_type = $1
  `;

  // Initialize params with the required issue type
  const params = [issueTypeFilter];

  // 2. Add Conditional Logic
  // If a department is provided, we append the AND clause and push the parameter.
  if (department) {
    sql += ` AND issue_submitter_department = $2`;
    params.push(department);
  }

  try {
    // 3. Execute ONE query
    // Instead of Promise.all with 5 requests, we make 1 round-trip to the DB.
    const result = await query(sql, params);
    const row = result[0];

    // 4. Return Data
    return NextResponse.json(
      {
        totals: parseInt(row?.totals || "0"),
        pending: parseInt(row?.pending || "0"),
        inProgress: parseInt(row?.in_progress || "0"), // Map snake_case DB column to camelCase JSON
        resolved: parseInt(row?.resolved || "0"),
        unfeasible: parseInt(row?.unfeasible || "0"),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error retrieving automation stats", error);
    return NextResponse.json(
      { totals: 0, pending: 0, inProgress: 0, resolved: 0, unfeasible: 0 },
      { status: 500 },
    );
  }
});
