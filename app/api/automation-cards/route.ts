import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { defaultCounts } from "@/public/assets";
import { AUTOMATION_TYPE_FILTERS as issueTypeFilters } from "@/public/assets";

export const GET = withAuth(async ({ request }) => {
  const searchParams = request.nextUrl.searchParams;
  const department = searchParams.get("department");

  // 1. Prepare Dynamic SQL
  // We start with the base requirement: filter by issue_type.
  // We will append the department filter only if it exists.
  let sql = `
    SELECT 

    -- Totals Counts
      COUNT(*) AS totals_total,
      COUNT(*) FILTER (WHERE issue_priority = 'Low') AS totals_low,
      COUNT(*) FILTER (WHERE issue_priority = 'Medium') AS totals_medium,
      COUNT(*) FILTER (WHERE issue_priority = 'High') AS totals_high,
      COUNT(*) FILTER (WHERE issue_priority = 'Critical') AS totals_critical,
      
      -- Open Counts
      COUNT(*) FILTER (WHERE issue_status = 'open') AS open_total,
      COUNT(*) FILTER (WHERE issue_status = 'open' AND issue_priority = 'Low') AS open_low,
      COUNT(*) FILTER (WHERE issue_status = 'open' AND issue_priority = 'Medium') AS open_medium,
      COUNT(*) FILTER (WHERE issue_status = 'open' AND issue_priority = 'High') AS open_high,
      COUNT(*) FILTER (WHERE issue_status = 'open' AND issue_priority = 'Critical') AS open_critical,

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

  const whereClauses: string[] = [];
  const params: (string | number)[] = [];

  if (department) {
    whereClauses.push(`issue_submitter_department = $${params.length + 1}`);
    params.push(department);
  }

  // 2. NEW: Issue Type Array Filter
  if (issueTypeFilters && issueTypeFilters.length > 0) {
    // Option A: Dynamic IN clauses ($2, $3, $4...)
    const placeholders = issueTypeFilters.map(
      (_, index) => `$${params.length + index + 1}`,
    );
    whereClauses.push(`issue_type IN (${placeholders.join(", ")})`);
    params.push(...issueTypeFilters);
  }

  if (whereClauses.length > 0) {
    sql += ` WHERE ${whereClauses.join(" AND ")}`;
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
        totals: {
          total: getCount(row.totals_total),
          low: getCount(row.totals_low),
          medium: getCount(row.totals_medium),
          high: getCount(row.totals_high),
          critical: getCount(row.totals_critical),
        },
        open: {
          total: getCount(row.open_total),
          low: getCount(row.open_low),
          medium: getCount(row.open_medium),
          high: getCount(row.open_high),
          critical: getCount(row.open_critical),
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
    console.error("Error retrieving automation stats", error);
    return NextResponse.json(defaultCounts, { status: 500 });
  }
});
