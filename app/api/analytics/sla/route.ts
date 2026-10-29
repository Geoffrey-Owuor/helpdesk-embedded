import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { hasFeatureAccess, FEATURES } from "@/lib/FeatureAccess";
import {
  buildAnalyticsIssuesFilter,
  parseAnalyticsFilterParams,
} from "@/lib/analytics/buildAnalyticsIssuesFilter";
import { slaIssuesCte, slaStateCounts } from "@/lib/analytics/slaIssuesCte";

// SLA compliance of the filtered issues against public.sla_policies - see
// lib/analytics/slaIssuesCte.ts for how each issue is judged. Agents are
// credited by the issue's assigned agent only, so each issue counts once.

type StateCounts<P extends string> = Record<
  `${P}_met` | `${P}_breached` | `${P}_pending`,
  string
>;

type OverallRow = StateCounts<"response"> &
  StateCounts<"resolution"> &
  StateCounts<"sla"> & { blended_target: string | null };

type PriorityRow = OverallRow & {
  priority_code: string;
  issue_priority: string;
  response_minutes: number;
  resolution_minutes: number;
  target_percent: string;
};

type ChangeRequestRow = StateCounts<"sla"> & { target_percent: string | null };

type AgentRow = OverallRow & { agent_name: string; agent_email: string };

type MonthlyRow = StateCounts<"sla"> & {
  month: string;
  agent_email: string | null;
  agent_name: string | null;
  blended_target: string | null;
};

const count = (value: string | undefined) => parseInt(value || "0", 10);
const decimal = (value: string | null | undefined) =>
  value === null || value === undefined ? null : parseFloat(value);

const stateCounts = <P extends string>(row: StateCounts<P>, prefix: P) => ({
  met: count(row[`${prefix}_met`]),
  breached: count(row[`${prefix}_breached`]),
  pending: count(row[`${prefix}_pending`]),
});

const allStateCounts = (row: OverallRow) => ({
  response: stateCounts(row, "response"),
  resolution: stateCounts(row, "resolution"),
  sla: stateCounts(row, "sla"),
  // The target this mix of priorities is held to: the average target of the
  // issues already judged
  blendedTarget: decimal(row.blended_target),
});

export const GET = withAuth(async ({ user, request }) => {
  if (!hasFeatureAccess(user, FEATURES.ANALYTICS)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const filters = parseAnalyticsFilterParams(request.nextUrl.searchParams);
  const { whereSql, params } = buildAnalyticsIssuesFilter(filters);
  const cte = `WITH ${slaIssuesCte(whereSql)}`;

  const allCounts = `
    ${slaStateCounts("response_state", "response")},
    ${slaStateCounts("resolution_state", "resolution")},
    ${slaStateCounts("sla_state", "sla")},
    AVG(target_percent) FILTER (WHERE sla_state <> 'pending') AS blended_target
  `;

  const overallQuery = `${cte} SELECT ${allCounts} FROM sla_verdicts`;

  // Every priority policy, including ones with no issues in view
  const priorityQuery = `
    ${cte}
    SELECT
      p.priority_code, p.issue_priority, p.response_minutes, p.resolution_minutes,
      p.target_percent,
      ${slaStateCounts("v.response_state", "response")},
      ${slaStateCounts("v.resolution_state", "resolution")},
      ${slaStateCounts("v.sla_state", "sla")},
      NULL AS blended_target
    FROM sla_policies p
    LEFT JOIN sla_verdicts v ON v.priority_code = p.priority_code
    WHERE p.priority_code <> 'CR'
    GROUP BY p.priority_code, p.issue_priority, p.response_minutes,
             p.resolution_minutes, p.target_percent
    ORDER BY p.priority_code
  `;

  const changeRequestQuery = `
    ${cte}
    SELECT
      ${slaStateCounts("sla_state", "sla")},
      (SELECT target_percent FROM sla_policies WHERE priority_code = 'CR') AS target_percent
    FROM sla_verdicts
    WHERE is_change_request
  `;

  const agentQuery = `
    ${cte}
    SELECT issue_agent_name AS agent_name, issue_agent_email AS agent_email, ${allCounts}
    FROM sla_verdicts
    WHERE issue_agent_email IS NOT NULL
    GROUP BY issue_agent_email, issue_agent_name
    ORDER BY COUNT(*) FILTER (WHERE sla_state <> 'pending') DESC, issue_agent_name
  `;

  // Per month of creation: one row for everyone (agent_email NULL) and one
  // per assigned agent
  const monthlyQuery = `
    ${cte}
    SELECT
      v.month,
      v.issue_agent_email AS agent_email,
      v.issue_agent_name AS agent_name,
      ${slaStateCounts("v.sla_state", "sla")},
      AVG(v.target_percent) FILTER (WHERE v.sla_state <> 'pending') AS blended_target
    FROM (
      SELECT *, to_char(date_trunc('month', issue_created_at), 'YYYY-MM') AS month
      FROM sla_verdicts
    ) v
    GROUP BY GROUPING SETS (
      (v.month),
      (v.month, v.issue_agent_email, v.issue_agent_name)
    )
    HAVING GROUPING(v.issue_agent_email) = 1 OR v.issue_agent_email IS NOT NULL
    ORDER BY v.month
  `;

  try {
    const [overall, priorities, changeRequests, agents, monthly] =
      await Promise.all([
        query<OverallRow>(overallQuery, params),
        query<PriorityRow>(priorityQuery, params),
        query<ChangeRequestRow>(changeRequestQuery, params),
        query<AgentRow>(agentQuery, params),
        query<MonthlyRow>(monthlyQuery, params),
      ]);

    return NextResponse.json(
      {
        overall: allStateCounts(overall[0]),
        priorities: priorities.map((r) => ({
          priorityCode: r.priority_code,
          priority: r.issue_priority,
          responseMinutes: r.response_minutes,
          resolutionMinutes: r.resolution_minutes,
          targetPercent: parseFloat(r.target_percent),
          ...allStateCounts(r),
        })),
        changeRequests: {
          sla: stateCounts(changeRequests[0], "sla"),
          targetPercent: decimal(changeRequests[0]?.target_percent),
        },
        agents: agents.map((r) => ({
          agentName: r.agent_name,
          agentEmail: r.agent_email,
          ...allStateCounts(r),
        })),
        monthly: monthly.map((r) => ({
          month: r.month,
          agentEmail: r.agent_email,
          agentName: r.agent_name,
          sla: stateCounts(r, "sla"),
          blendedTarget: decimal(r.blended_target),
        })),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error retrieving analytics SLA", error);
    return NextResponse.json(
      { message: "Error retrieving SLA compliance" },
      { status: 500 },
    );
  }
});
