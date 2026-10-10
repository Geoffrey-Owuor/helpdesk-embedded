"use server";

import { query } from "@/lib/Db";
import { requireSession } from "@/lib/Auth";
import { canViewIssue } from "@/lib/IssueAccess";

export interface EscalationRow {
  id: number;
  issue_escalation_reason: string;
  issue_escalator_name: string;
  issue_escalated_agent_name: string;
  issue_escalation_date: string;
}

export async function getEscalationHistory(
  uuid: string,
): Promise<EscalationRow[] | []> {
  const session = await requireSession();

  // Only for those who can see the issue (analytics viewers included)
  if (
    !session ||
    !(await canViewIssue(uuid, session, { allowAnalytics: true }))
  ) {
    return [];
  }
  const baseQuery = `
    SELECT 
    id, issue_escalation_reason,
    issue_escalator_name, issue_escalation_date,
    issue_escalated_agent_name
    FROM issue_escalation WHERE issue_id = $1
    ORDER BY issue_escalation_date DESC
    `;

  try {
    const result = await query<EscalationRow>(baseQuery, [uuid]);

    return result;
  } catch (error) {
    console.error("Error while trying to get issue escalation data:", error);
    return [];
  }
}
