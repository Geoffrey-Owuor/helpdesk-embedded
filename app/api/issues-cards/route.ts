import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { defaultCounts } from "@/public/assets";

export const GET = withAuth(async ({ user, request }) => {
  const { userId, role, email, department, isSuper } = user;
  const searchParams = request.nextUrl.searchParams;
  const agentAdminFilter = searchParams.get("agentAdminFilter");
  const superAdminFilter = searchParams.get("superAdminFilter");

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
  `;

  if (!superAdminFilter || !isSuper) sql += ` WHERE ${filterColumn} = $1`;
  const params = superAdminFilter && isSuper ? [] : [filterValue];

  try {
    // 3. Execute ONE query
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
    console.error("Error retrieving status counts", error);
    return NextResponse.json(defaultCounts, { status: 500 });
  }
});
