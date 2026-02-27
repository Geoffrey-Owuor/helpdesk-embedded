import { NextResponse } from "next/server";
import { query } from "@/lib/Db";
import ExcelJS from "exceljs";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";

export const GET = withAuth(async ({ request, user }) => {
  // user information we need
  const { role, department, userId, email } = user;

  //Our base query
  let baseQuery = `
    SELECT issue_uuid, issue_reference_id, issue_submitter_name, issue_submitter_department,
    issue_target_department, issue_type, issue_title, issue_description, issue_created_at, issue_updated_at, issue_status,
    issue_agent_name, issue_agent_email, issue_assigner_name, issue_assigner_email
    FROM issues_table
    `;

  // Our params
  const searchParams = request.nextUrl.searchParams;

  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");
  const fetchAutomations = searchParams.get("fetchAutomations");
  const agentAdminFilter = searchParams.get("agentAdminFilter");

  const whereClauses: string[] = [];
  const params: (string | number)[] = [];

  // constructing clauses based on the fetch automations params
  if (fetchAutomations === "fetchAutomations") {
    whereClauses.push(`issue_type = $${params.length + 1}`);
    params.push("Automation");
  }

  // Constructing clauses based on role
  if (role === "admin") {
    if (agentAdminFilter === "agentAdminFilter") {
      whereClauses.push(`issue_submitter_id = $${params.length + 1}`);
      params.push(userId);
    } else {
      whereClauses.push(`issue_target_department = $${params.length + 1}`);
      params.push(department);
    }
  } else if (role === "agent") {
    if (agentAdminFilter === "agentAdminFilter") {
      whereClauses.push(`issue_submitter_id = $${params.length + 1}`);
      params.push(userId);
    } else {
      whereClauses.push(`issue_agent_email = $${params.length + 1}`);
      params.push(email);
    }
  } else if (role === "user") {
    whereClauses.push(`issue_submitter_id = $${params.length + 1}`);
    params.push(userId);
  }

  //Clauses based on the passed date
  if (fromDate && toDate) {
    whereClauses.push(`issue_created_at >= $${params.length + 1}`);
    params.push(fromDate);

    whereClauses.push(`issue_created_at <= $${params.length + 1}`);
    // Check if it's just a date string (length 10 usually implies YYYY-MM-DD)
    // If so, append end-of-day time. Otherwise use as is.
    // This helps when searching issues submitted within a specific day
    const finalToDate = toDate.length === 10 ? `${toDate} 23:59:59` : toDate;
    params.push(finalToDate);
  }
});
