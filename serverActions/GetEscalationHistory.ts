"use server";

import { query } from "@/lib/Db";

export interface EscalationRow {
  id: number;
  issue_escalation_reason: string;
  issue_escalator_name: string;
  issue_escalation_date: string;
}

export async function getEscalationHistory(
  uuid: string,
): Promise<EscalationRow[] | []> {
  const baseQuery = `
    SELECT 
    id, issue_escalation_reason,
    issue_escalator_name, issue_escalation_date,
    issue_escalated_agent_name
    FROM issue_escalation WHERE issue_id = $1
    `;

  try {
    const result = await query<EscalationRow>(baseQuery, [uuid]);

    return result;
  } catch (error) {
    console.error("Error while trying to get issue escalation data:", error);
    return [];
  }
}
