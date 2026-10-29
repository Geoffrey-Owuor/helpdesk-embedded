// The single-issue SELECT shared by app/api/get-issue (role-visibility gated)
// and app/api/analytics/issue (analytics feature gated). Callers append their
// own WHERE clause; the issues_table alias is always "a".
// Counts are cast to int so they arrive as numbers, not pg's bigint strings.
// The first reopen/escalation also stores a row for the original state (the
// "first creation" entry in the history modals), so those two subtract it to
// give the number of actual reopens/escalations.
export const ISSUE_DETAIL_SELECT = `
  SELECT
    a.issue_uuid, a.issue_reference_id, a.issue_submitter_id, a.issue_submitter_name,
    a.issue_submitter_email, a.issue_submitter_department, a.issue_target_department,
    a.issue_type, a.issue_title, a.issue_description, a.issue_status, a.issue_priority,
    a.issue_remarks, a.issue_agent_name, a.issue_agent_email, a.issue_assigner_name,
    a.issue_assigner_email, a.issue_created_at, a.issue_updated_at, a.issue_date_resolved,
    a.issue_date_closed, a.issue_close_reason,
    (SELECT COUNT(*)::int FROM issue_attachments b WHERE b.issue_id = a.issue_uuid) AS attachments_count,
    (SELECT GREATEST(COUNT(*)::int - 1, 0) FROM issue_reopening c WHERE c.issue_id = a.issue_uuid) AS reopened_count,
    (SELECT GREATEST(COUNT(*)::int - 1, 0) FROM issue_escalation d WHERE d.issue_id = a.issue_uuid) AS escalated_count,
    (SELECT COUNT(*)::int FROM issue_collaborators e WHERE e.issue_id = a.issue_uuid) AS collaborators_count
  FROM issues_table a
`;
