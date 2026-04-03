import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { defaultCounts } from "@/public/assets";

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
      
      -- Pending Counts
      COUNT(*) FILTER (WHERE issue_status = 'pending') AS pending_total,
      COUNT(*) FILTER (WHERE issue_status = 'pending' AND issue_priority = 'Low') AS pending_low,
      COUNT(*) FILTER (WHERE issue_status = 'pending' AND issue_priority = 'Medium') AS pending_medium,
      COUNT(*) FILTER (WHERE issue_status = 'pending' AND issue_priority = 'High') AS pending_high,
      COUNT(*) FILTER (WHERE issue_status = 'pending' AND issue_priority = 'Critical') AS pending_critical,

      -- In Progress Counts
      COUNT(*) FILTER (WHERE issue_status = 'in progress') AS in_progress_total,
      COUNT(*) FILTER (WHERE issue_status = 'in progress' AND issue_priority = 'Low') AS in_progress_low,
      COUNT(*) FILTER (WHERE issue_status = 'in progress' AND issue_priority = 'Medium') AS in_progress_medium,
      COUNT(*) FILTER (WHERE issue_status = 'in progress' AND issue_priority = 'High') AS in_progress_high,
      COUNT(*) FILTER (WHERE issue_status = 'in progress' AND issue_priority = 'Critical') AS in_progress_critical,

      -- Resolved Counts
      COUNT(*) FILTER (WHERE issue_status = 'resolved') AS resolved_total,
      COUNT(*) FILTER (WHERE issue_status = 'resolved' AND issue_priority = 'Low') AS resolved_low,
      COUNT(*) FILTER (WHERE issue_status = 'resolved' AND issue_priority = 'Medium') AS resolved_medium,
      COUNT(*) FILTER (WHERE issue_status = 'resolved' AND issue_priority = 'High') AS resolved_high,
      COUNT(*) FILTER (WHERE issue_status = 'resolved' AND issue_priority = 'Critical') AS resolved_critical,

      -- Unfeasible Counts
      COUNT(*) FILTER (WHERE issue_status = 'unfeasible') AS unfeasible_total,
      COUNT(*) FILTER (WHERE issue_status = 'unfeasible' AND issue_priority = 'Low') AS unfeasible_low,
      COUNT(*) FILTER (WHERE issue_status = 'unfeasible' AND issue_priority = 'Medium') AS unfeasible_medium,
      COUNT(*) FILTER (WHERE issue_status = 'unfeasible' AND issue_priority = 'High') AS unfeasible_high,
      COUNT(*) FILTER (WHERE issue_status = 'unfeasible' AND issue_priority = 'Critical') AS unfeasible_critical
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

    // Helper function to safely parse ints
    const getCount = (val: string) => parseInt(val || "0", 10);

    // 4. Return Data
    return NextResponse.json(
      {
        totals: getCount(row.totals),
        pending: {
          total: getCount(row.pending_total),
          low: getCount(row.pending_low),
          medium: getCount(row.pending_medium),
          high: getCount(row.pending_high),
          critical: getCount(row.pending_critical),
        },
        inProgress: {
          total: getCount(row.in_progress_total),
          low: getCount(row.in_progress_low),
          medium: getCount(row.in_progress_medium),
          high: getCount(row.in_progress_high),
          critical: getCount(row.in_progress_critical),
        },
        resolved: {
          total: getCount(row.resolved_total),
          low: getCount(row.resolved_low),
          medium: getCount(row.resolved_medium),
          high: getCount(row.resolved_high),
          critical: getCount(row.resolved_critical),
        },
        unfeasible: {
          total: getCount(row.unfeasible_total),
          low: getCount(row.unfeasible_low),
          medium: getCount(row.unfeasible_medium),
          high: getCount(row.unfeasible_high),
          critical: getCount(row.unfeasible_critical),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error retrieving automation stats", error);
    return NextResponse.json(defaultCounts, { status: 500 });
  }
});
