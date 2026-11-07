import { NextResponse } from "next/server";
import { query } from "@/lib/Db";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { Workbook } from "exceljs";
import {
  EXCEL_DATE_FORMAT,
  excelDate,
  sqlExcelTimestamp,
  styleDataSheet,
  xlsxResponse,
} from "@/lib/excel/workbook";

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
    ${sqlExcelTimestamp("created_at")} AS created_at
    FROM users ORDER BY created_at DESC
    `;

    // Running the query
    const rows = await query<Record<string, unknown>>(baseQuery);

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "There are no users to export" },
        { status: 404 },
      );
    }

    // Creating a workbook with exceljs and adding a new worksheet;
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Users_Data");

    // Defining the columns for our worksheet
    worksheet.columns = Object.keys(rows[0]).map((key) => ({
      // Split by an underscore, capitalize first letter of each word and join with a space
      header: key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      key: key,
      width: key === "email" ? 32 : 20,
      style: key.endsWith("_at") ? { numFmt: EXCEL_DATE_FORMAT } : undefined,
    }));

    // Timestamps are wall-clock text, written as real Excel dates
    worksheet.addRows(
      rows.map((row) => ({
        ...row,
        created_at: excelDate(row.created_at as string | null),
      })),
    );
    styleDataSheet(worksheet);

    return xlsxResponse(workbook, "users_data.xlsx");
  } catch (error) {
    console.error("Failed to export users data to excel:", error);
    return NextResponse.json(
      { message: "Failed to export users data to excel" },
      { status: 500 },
    );
  }
});
