import { NextResponse } from "next/server";
import { query } from "@/lib/Db";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { Workbook } from "exceljs";

export const GET = withAuth(async ({ user }) => {
  const { isSuper } = user;

  if (!isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    // Our base query
    const baseQuery = `
     SELECT
      agents.username AS agent_name,
      agents.email AS agent_email,
      COALESCE(m.issue_type, 'Unassigned') AS issue_type,
      COALESCE(m.issue_priority, 'None') AS issue_priority,
      COALESCE(m.id::text, gen_random_uuid()::text) AS issue_id,
      COALESCE((SELECT username FROM users WHERE user_id = m.admin_id), 'Unassigned') AS admin_name,
      COALESCE((SELECT email FROM users WHERE user_id = m.admin_id), 'Unassigned') AS admin_email
    FROM users AS agents
    LEFT JOIN issues_mapping AS m ON agents.user_id = m.agent_id
    WHERE (agents.role = 'agent' OR agents.role = 'admin')
    `;

    // Running the query
    const rows = await query(baseQuery);

    // Creating a workbook with exceljs and adding a new worksheet;
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Issues_Mapping");

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
        numFmt: key.includes("ated_at") ? "yyyy-mm-dd hh:mm:ss" : undefined,
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
        "Content-Disposition": 'attachment; filename="issues_mapping.xlsx"',
      },
    });
  } catch (error) {
    console.error("Failed to export users data to excel:", error);
    return NextResponse.json(
      { message: "Failed to export users data to excel" },
      { status: 500 },
    );
  }
});
