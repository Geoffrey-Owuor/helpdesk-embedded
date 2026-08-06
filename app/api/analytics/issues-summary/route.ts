import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { hasFeatureAccess, FEATURES } from "@/lib/FeatureAccess";
import { defaultCounts } from "@/public/assets";
import {
  buildAnalyticsIssuesFilter,
  parseAnalyticsFilterParams,
} from "@/lib/analytics/buildAnalyticsIssuesFilter";

interface PivotRow {
  open_total: string;
  open_low: string;
  open_medium: string;
  open_high: string;
  open_critical: string;
  in_progress_total: string;
  in_progress_low: string;
  in_progress_medium: string;
  in_progress_high: string;
  in_progress_critical: string;
  resolved_total: string;
  resolved_low: string;
  resolved_medium: string;
  resolved_high: string;
  resolved_critical: string;
  closed_total: string;
  closed_low: string;
  closed_medium: string;
  closed_high: string;
  closed_critical: string;
  reopened_count: string;
  escalated_count: string;
  collaborated_count: string;
  avg_resolution_seconds: string | null;
  avg_stale_seconds: string | null;
  total_filtered: string;
}

interface TypeBreakdownRow {
  issue_type: string;
  count: string;
  avg_resolution_seconds: string | null;
  avg_stale_seconds: string | null;
}

interface AgentBreakdownRow {
  agent_name: string;
  count: string;
  avg_resolution_seconds: string | null;
  avg_stale_seconds: string | null;
}

interface DepartmentBreakdownRow {
  department: string;
  count: string;
  avg_resolution_seconds: string | null;
  avg_stale_seconds: string | null;
}

export const GET = withAuth(async ({ user, request }) => {
  if (!hasFeatureAccess(user, FEATURES.ANALYTICS)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const filters = parseAnalyticsFilterParams(searchParams);
  const { whereSql, params } = buildAnalyticsIssuesFilter(filters);

  const pivotQuery = `
    SELECT
      COUNT(*) FILTER (WHERE a.issue_status = 'open') AS open_total,
      COUNT(*) FILTER (WHERE a.issue_status = 'open' AND a.issue_priority = 'Low') AS open_low,
      COUNT(*) FILTER (WHERE a.issue_status = 'open' AND a.issue_priority = 'Medium') AS open_medium,
      COUNT(*) FILTER (WHERE a.issue_status = 'open' AND a.issue_priority = 'High') AS open_high,
      COUNT(*) FILTER (WHERE a.issue_status = 'open' AND a.issue_priority = 'Critical') AS open_critical,

      COUNT(*) FILTER (WHERE a.issue_status = 'in progress') AS in_progress_total,
      COUNT(*) FILTER (WHERE a.issue_status = 'in progress' AND a.issue_priority = 'Low') AS in_progress_low,
      COUNT(*) FILTER (WHERE a.issue_status = 'in progress' AND a.issue_priority = 'Medium') AS in_progress_medium,
      COUNT(*) FILTER (WHERE a.issue_status = 'in progress' AND a.issue_priority = 'High') AS in_progress_high,
      COUNT(*) FILTER (WHERE a.issue_status = 'in progress' AND a.issue_priority = 'Critical') AS in_progress_critical,

      COUNT(*) FILTER (WHERE a.issue_status = 'resolved') AS resolved_total,
      COUNT(*) FILTER (WHERE a.issue_status = 'resolved' AND a.issue_priority = 'Low') AS resolved_low,
      COUNT(*) FILTER (WHERE a.issue_status = 'resolved' AND a.issue_priority = 'Medium') AS resolved_medium,
      COUNT(*) FILTER (WHERE a.issue_status = 'resolved' AND a.issue_priority = 'High') AS resolved_high,
      COUNT(*) FILTER (WHERE a.issue_status = 'resolved' AND a.issue_priority = 'Critical') AS resolved_critical,

      COUNT(*) FILTER (WHERE a.issue_status = 'closed') AS closed_total,
      COUNT(*) FILTER (WHERE a.issue_status = 'closed' AND a.issue_priority = 'Low') AS closed_low,
      COUNT(*) FILTER (WHERE a.issue_status = 'closed' AND a.issue_priority = 'Medium') AS closed_medium,
      COUNT(*) FILTER (WHERE a.issue_status = 'closed' AND a.issue_priority = 'High') AS closed_high,
      COUNT(*) FILTER (WHERE a.issue_status = 'closed' AND a.issue_priority = 'Critical') AS closed_critical,

      COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM issue_reopening r WHERE r.issue_id = a.issue_uuid)) AS reopened_count,
      COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM issue_escalation esc WHERE esc.issue_id = a.issue_uuid)) AS escalated_count,
      COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM issue_collaborators col WHERE col.issue_id = a.issue_uuid)) AS collaborated_count,

      AVG(EXTRACT(EPOCH FROM (a.issue_date_resolved - a.issue_created_at)))
        FILTER (WHERE a.issue_date_resolved IS NOT NULL AND a.issue_status IN ('resolved', 'closed')) AS avg_resolution_seconds,
      AVG(EXTRACT(EPOCH FROM (NOW() - a.issue_created_at)))
        FILTER (WHERE a.issue_status IN ('open', 'in progress')) AS avg_stale_seconds,

      COUNT(*) AS total_filtered
    FROM issues_table a
    ${whereSql}
  `;

  const timingAggregatesSql = `
      AVG(EXTRACT(EPOCH FROM (a.issue_date_resolved - a.issue_created_at)))
        FILTER (WHERE a.issue_date_resolved IS NOT NULL AND a.issue_status IN ('resolved', 'closed')) AS avg_resolution_seconds,
      AVG(EXTRACT(EPOCH FROM (NOW() - a.issue_created_at)))
        FILTER (WHERE a.issue_status IN ('open', 'in progress')) AS avg_stale_seconds
  `;

  const typeBreakdownQuery = `
    SELECT a.issue_type, COUNT(*) AS count, ${timingAggregatesSql}
    FROM issues_table a
    ${whereSql}
    GROUP BY a.issue_type
    ORDER BY count DESC
  `;

  // Common table expression
  const agentBreakdownQuery = `
    WITH filtered_issues AS (
      SELECT a.issue_uuid, a.issue_agent_name, a.issue_agent_email, a.issue_status,
             a.issue_created_at, a.issue_date_resolved
      FROM issues_table a
      ${whereSql}
    ),
    agent_issue_map AS (
      SELECT issue_uuid, issue_agent_name AS agent_name, issue_agent_email AS agent_email,
             issue_status, issue_created_at, issue_date_resolved
      FROM filtered_issues
      WHERE issue_agent_email IS NOT NULL

      UNION ALL

      SELECT fi.issue_uuid, col.collaborator_name AS agent_name, col.collaborator_email AS agent_email,
             fi.issue_status, fi.issue_created_at, fi.issue_date_resolved
      FROM filtered_issues fi
      JOIN issue_collaborators col ON col.issue_id = fi.issue_uuid
    )
    SELECT
      agent_name,
      COUNT(*) AS count,
      AVG(EXTRACT(EPOCH FROM (issue_date_resolved - issue_created_at)))
        FILTER (WHERE issue_date_resolved IS NOT NULL AND issue_status IN ('resolved', 'closed')) AS avg_resolution_seconds,
      AVG(EXTRACT(EPOCH FROM (NOW() - issue_created_at)))
        FILTER (WHERE issue_status IN ('open', 'in progress')) AS avg_stale_seconds
    FROM agent_issue_map
    GROUP BY agent_email, agent_name
    ORDER BY count DESC
  `;

  const departmentBreakdownQuery = `
    SELECT a.issue_submitter_department AS department, COUNT(*) AS count, ${timingAggregatesSql}
    FROM issues_table a
    ${whereSql}
    GROUP BY a.issue_submitter_department
    ORDER BY count DESC
  `;

  try {
    const [
      pivotResult,
      typeBreakdownResult,
      agentBreakdownResult,
      departmentBreakdownResult,
    ] = await Promise.all([
      query<PivotRow>(pivotQuery, params),
      query<TypeBreakdownRow>(typeBreakdownQuery, params),
      query<AgentBreakdownRow>(agentBreakdownQuery, params),
      query<DepartmentBreakdownRow>(departmentBreakdownQuery, params),
    ]);

    const row = pivotResult[0];
    const getCount = (val: string | undefined) => parseInt(val || "0", 10);
    const getAvg = (val: string | null | undefined) =>
      val === null || val === undefined ? null : parseFloat(val);

    return NextResponse.json(
      {
        statusCounts: {
          open: {
            total: getCount(row?.open_total),
            low: getCount(row?.open_low),
            medium: getCount(row?.open_medium),
            high: getCount(row?.open_high),
            critical: getCount(row?.open_critical),
          },
          inProgress: {
            total: getCount(row?.in_progress_total),
            low: getCount(row?.in_progress_low),
            medium: getCount(row?.in_progress_medium),
            high: getCount(row?.in_progress_high),
            critical: getCount(row?.in_progress_critical),
          },
          resolved: {
            total: getCount(row?.resolved_total),
            low: getCount(row?.resolved_low),
            medium: getCount(row?.resolved_medium),
            high: getCount(row?.resolved_high),
            critical: getCount(row?.resolved_critical),
          },
          closed: {
            total: getCount(row?.closed_total),
            low: getCount(row?.closed_low),
            medium: getCount(row?.closed_medium),
            high: getCount(row?.closed_high),
            critical: getCount(row?.closed_critical),
          },
        },
        reopenedCount: getCount(row?.reopened_count),
        escalatedCount: getCount(row?.escalated_count),
        collaboratedCount: getCount(row?.collaborated_count),
        avgResolutionSeconds: getAvg(row?.avg_resolution_seconds),
        avgStaleSeconds: getAvg(row?.avg_stale_seconds),
        totalFiltered: getCount(row?.total_filtered),
        issueTypeBreakdown: typeBreakdownResult.map((r) => ({
          issueType: r.issue_type,
          count: getCount(r.count),
          avgResolutionSeconds: getAvg(r.avg_resolution_seconds),
          avgStaleSeconds: getAvg(r.avg_stale_seconds),
        })),
        agentBreakdown: agentBreakdownResult.map((r) => ({
          agentName: r.agent_name,
          count: getCount(r.count),
          avgResolutionSeconds: getAvg(r.avg_resolution_seconds),
          avgStaleSeconds: getAvg(r.avg_stale_seconds),
        })),
        departmentBreakdown: departmentBreakdownResult.map((r) => ({
          department: r.department,
          count: getCount(r.count),
          avgResolutionSeconds: getAvg(r.avg_resolution_seconds),
          avgStaleSeconds: getAvg(r.avg_stale_seconds),
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error retrieving analytics summary", error);
    return NextResponse.json(
      {
        statusCounts: defaultCounts,
        reopenedCount: 0,
        escalatedCount: 0,
        collaboratedCount: 0,
        avgResolutionSeconds: null,
        avgStaleSeconds: null,
        totalFiltered: 0,
        issueTypeBreakdown: [],
        agentBreakdown: [],
        departmentBreakdown: [],
      },
      { status: 500 },
    );
  }
});
