// The per-issue SLA verdicts the analytics SLA route aggregates, as a CTE
// named sla_issues over the filtered issues (alias "a", same WHERE clause as
// every other analytics query). Targets come from public.sla_policies
// (migrations/008), matched on priority; issues with no policy, or closed
// without being resolved (issue_close_reason), are left out.
//
// Each of response_state, resolution_state and sla_state is 'met',
// 'breached' or 'pending' (still inside its target, not counted yet):
// - response: met/breached by issue_first_response_at; an open issue with no
//   response yet breaches once it's past the target. NULL - not counted -
//   for issues that moved on before first responses were recorded.
// - resolution: met/breached by issue_date_resolved; an unresolved issue
//   breaches once it's past the target.
// - sla (within SLA): both met; breached if either breached.
// Times are calendar time, matching the policy.
export const slaIssuesCte = (whereSql: string) => `
  sla_issues AS (
    SELECT
      a.issue_uuid,
      a.issue_agent_name,
      a.issue_agent_email,
      a.issue_created_at,
      p.priority_code,
      p.target_percent,
      COALESCE(m.is_change_request, false) AS is_change_request,
      CASE
        WHEN a.issue_first_response_at IS NOT NULL THEN
          CASE WHEN a.issue_first_response_at - a.issue_created_at
                    <= make_interval(mins => p.response_minutes)
               THEN 'met' ELSE 'breached' END
        WHEN a.issue_status = 'open' THEN
          CASE WHEN NOW() - a.issue_created_at
                    > make_interval(mins => p.response_minutes)
               THEN 'breached' ELSE 'pending' END
      END AS response_state,
      CASE
        WHEN a.issue_status IN ('resolved', 'closed') AND a.issue_date_resolved IS NOT NULL THEN
          CASE WHEN a.issue_date_resolved - a.issue_created_at
                    <= make_interval(mins => p.resolution_minutes)
               THEN 'met' ELSE 'breached' END
        WHEN NOW() - a.issue_created_at > make_interval(mins => p.resolution_minutes)
          THEN 'breached'
        ELSE 'pending'
      END AS resolution_state
    FROM issues_table a
    JOIN sla_policies p ON p.issue_priority = a.issue_priority
    -- Issue types are unique ignoring case (migrations/007)
    LEFT JOIN issues_mapping m ON LOWER(m.issue_type) = LOWER(a.issue_type)
    ${whereSql ? `${whereSql} AND` : "WHERE"} a.issue_close_reason IS NULL
  ),
  sla_verdicts AS (
    SELECT
      s.*,
      CASE
        WHEN s.response_state = 'breached' OR s.resolution_state = 'breached' THEN 'breached'
        WHEN s.response_state = 'pending' OR s.resolution_state = 'pending' THEN 'pending'
        ELSE 'met'
      END AS sla_state
    FROM sla_issues s
  )
`;

// met / breached / pending counts for one state column, as SELECT list items
export const slaStateCounts = (column: string, prefix: string) => `
  COUNT(*) FILTER (WHERE ${column} = 'met') AS ${prefix}_met,
  COUNT(*) FILTER (WHERE ${column} = 'breached') AS ${prefix}_breached,
  COUNT(*) FILTER (WHERE ${column} = 'pending') AS ${prefix}_pending
`;
