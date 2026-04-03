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
    SELECT user_id, username, email, department, role, is_user_active, 
    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
    FROM users ORDER BY created_at DESC
    `;

    // Running the query
    const rows = await query(baseQuery);

    // Creating a workbook with exceljs and adding a new worksheet;
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Users_Data");

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
        "Content-Disposition": 'attachment; filename="users_data.xlsx"',
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
