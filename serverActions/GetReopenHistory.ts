"use server";

import { query } from "@/lib/Db";

export interface ReopenRow {
  id: number;
  issue_reopen_reason: string;
  issue_reopener_name: string;
  issue_reopen_date: string;
}

export async function getReopenHistory(
  uuid: string,
): Promise<ReopenRow[] | []> {
  const baseQuery = `
    SELECT
    id, issue_reopen_reason,
    issue_reopener_name, issue_reopen_date
    FROM issue_reopening WHERE issue_id = $1
    ORDER BY issue_reopen_date DESC
    `;

  try {
    const result = await query<ReopenRow>(baseQuery, [uuid]);

    return result;
  } catch (error) {
    console.error("Error while trying to get issue reopen data:", error);
    return [];
  }
}
