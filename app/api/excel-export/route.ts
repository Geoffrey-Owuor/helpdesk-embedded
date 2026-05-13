import { NextResponse } from "next/server";
import { query } from "@/lib/Db";
import { Workbook } from "exceljs";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";

const LIMIT = 500;

export const GET = withAuth(async ({ request, user }) => {
  // user information we need
  const { role, department, userId, email, isSuper } = user;

  try {
    //Our base query
    let baseQuery = `
      SELECT issue_uuid, 
        TO_CHAR(a.issue_created_at, 'YYYY-MM-DD HH24:MI:SS') AS issue_created_at, 
        a.issue_reference_id, a.issue_submitter_name, a.issue_submitter_department,
        a.issue_target_department, a.issue_type, a.issue_priority, a.issue_title, 
        a.issue_description, a.issue_status, a.issue_agent_name, a.issue_agent_email, 
        a.issue_assigner_name, a.issue_assigner_email, a.issue_remarks,
        TO_CHAR(a.issue_updated_at, 'YYYY-MM-DD HH24:MI:SS') AS issue_updated_at, 
        TO_CHAR(a.issue_date_resolved, 'YYYY-MM-DD HH24:MI:SS') AS issue_date_resolved,
        TO_CHAR(a.issue_date_closed, 'YYYY-MM-DD HH24:MI:SS') AS issue_date_closed,
        b.issue_reopen_reason, b.issue_reopener_name, b.issue_reopen_date,
        c.issue_escalation_reason, c.issue_escalator_name, c.issue_escalation_date
      FROM issues_table a
      LEFT JOIN (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY issue_id ORDER BY id DESC) AS rn
        FROM issue_reopening
      ) b ON a.issue_uuid = b.issue_id AND b.rn = 1
      LEFT JOIN (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY issue_id ORDER BY id DESC) AS rn
        FROM issue_escalation
      ) c ON a.issue_uuid = c.issue_id AND c.rn = 1
    `;

    // Our params
    const searchParams = request.nextUrl.searchParams;

    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const fetchAutomations = searchParams.get("fetchAutomations");
    const agentAdminFilter = searchParams.get("agentAdminFilter");
    const superAdminFilter = searchParams.get("superAdminFilter");

    const whereClauses: string[] = [];
    const params: (string | number)[] = [];

    // constructing clauses based on the fetch automations params
    if (fetchAutomations === "automations") {
      whereClauses.push(`issue_type = $${params.length + 1}`);
      params.push("Automation");
    } else {
      // get issues without the automations flag
      // Constructing clauses based on role
      // And if the super admin filter is enabled
      if (!isSuper || !superAdminFilter) {
        if (role === "admin") {
          if (agentAdminFilter === "agentAdminFilter") {
            whereClauses.push(`a.issue_submitter_id = $${params.length + 1}`);
            params.push(userId);
          } else {
            whereClauses.push(
              `a.issue_target_department = $${params.length + 1}`,
            );
            params.push(department);
          }
        } else if (role === "agent") {
          if (agentAdminFilter === "agentAdminFilter") {
            whereClauses.push(`a.issue_submitter_id = $${params.length + 1}`);
            params.push(userId);
          } else {
            whereClauses.push(`a.issue_agent_email = $${params.length + 1}`);
            params.push(email);
          }
        } else if (role === "user") {
          whereClauses.push(`a.issue_submitter_id = $${params.length + 1}`);
          params.push(userId);
        }
      }
    }

    //Clauses based on the passed dates
    if (fromDate && toDate) {
      whereClauses.push(
        `issue_created_at::date BETWEEN $${params.length + 1} AND $${params.length + 2}`,
      );
      params.push(fromDate, toDate);
    }

    if (whereClauses.length > 0) {
      baseQuery += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    // Drafting the final query
    baseQuery += ` ORDER BY issue_created_at DESC LIMIT $${params.length + 1}`;
    params.push(LIMIT);

    //Running the query
    const rows = await query(baseQuery, params);

    // Creating a workbook with exceljs and adding a new worksheet;
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Issues_Data");

    // Defining the columns for our worksheet
    if (rows.length > 0) {
      worksheet.columns = Object.keys(rows[0]).map((key) => ({
        // Split by an underscore, capitalize first letter of each word and join with a space
        header: key
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        key: key,
        width: 20,
        numFmt: ["ated_at", "issue_date"].some((str) => key.includes(str))
          ? "yyyy-mm-dd hh:mm:ss"
          : undefined,
      }));

      // Make the entire header row bold
      worksheet.getRow(1).font = { bold: true };

      // Add the data rows
      worksheet.addRows(rows);
    }

    // Generate a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // send the file as a response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="issues_data.xlsx"',
      },
    });
  } catch (error) {
    console.error("Failed to export issues data to excel:", error);
    return NextResponse.json(
      { message: "Failed to export issues data to excel" },
      { status: 500 },
    );
  }
});
