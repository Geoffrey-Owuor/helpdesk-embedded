import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { defaultCounts } from "@/public/assets";

export const GET = withAuth(async ({ user, request }) => {
  const { userId, role, email, department, isSuper } = user;
  const searchParams = request.nextUrl.searchParams;
  const agentAdminFilter = searchParams.get("agentAdminFilter");
  const superAdminFilter = searchParams.get("superAdminFilter");

  // 1. Determine Dynamic Clause & Value
  // This has to mirror the visibility rules in /api/get-issues exactly,
  // otherwise the cards will disagree with the issues table
  let filterClause = "issue_submitter_id = $1";
  let filterValue = userId;

  switch (role) {
    case "admin":
      if (agentAdminFilter !== "agentAdminFilter") {
        filterClause = "issue_target_department = $1";
        filterValue = department;
      }
      break;
    case "agent":
      if (agentAdminFilter !== "agentAdminFilter") {
        // Agents count their assigned issues plus the ones they collaborate on
        filterClause = `(issue_agent_email = $1
          OR EXISTS (
            SELECT 1 FROM issue_collaborators ic
            WHERE ic.issue_id = issues_table.issue_uuid
            AND ic.collaborator_email = $1
          ))`;
        filterValue = email;
      }
      break;
  }

  // 2. The Optimized Query: "The Pivot"
  // We scan the table ONCE. As we look at each row, we decide which "bucket" it counts towards.
  let sql = `
    SELECT 
      
      -- Open Counts
      COUNT(*) FILTER (WHERE issue_status = 'open') AS open_total,
      COUNT(*) FILTER (WHERE issue_status = 'open' AND issue_priority = 'Low') AS open_low,
      COUNT(*) FILTER (WHERE issue_status = 'open' AND issue_priority = 'Medium') AS open_medium,
      COUNT(*) FILTER (WHERE issue_status = 'open' AND issue_priority = 'High') AS open_high,
      COUNT(*) FILTER (WHERE issue_status = 'open' AND issue_priority = 'Critical') AS open_critical,

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

      -- Closed Counts
      COUNT(*) FILTER (WHERE issue_status = 'closed') AS closed_total,
      COUNT(*) FILTER (WHERE issue_status = 'closed' AND issue_priority = 'Low') AS closed_low,
      COUNT(*) FILTER (WHERE issue_status = 'closed' AND issue_priority = 'Medium') AS closed_medium,
      COUNT(*) FILTER (WHERE issue_status = 'closed' AND issue_priority = 'High') AS closed_high,
      COUNT(*) FILTER (WHERE issue_status = 'closed' AND issue_priority = 'Critical') AS closed_critical
    FROM issues_table
  `;

  if (!superAdminFilter || !isSuper) sql += ` WHERE ${filterClause}`;
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
        open: {
          total: getCount(row.open_total),
          low: getCount(row.open_low),
          medium: getCount(row.open_medium),
          high: getCount(row.open_high),
          critical: getCount(row.open_critical),
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
        closed: {
          total: getCount(row.closed_total),
          low: getCount(row.closed_low),
          medium: getCount(row.closed_medium),
          high: getCount(row.closed_high),
          critical: getCount(row.closed_critical),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error retrieving status counts", error);
    return NextResponse.json(defaultCounts, { status: 500 });
  }
});
