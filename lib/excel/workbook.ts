import { NextResponse } from "next/server";
import type { Workbook } from "exceljs";

// Shared helpers for the Excel export routes (issues, users, issue mapping).

export const XLSX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const EXCEL_DATE_FORMAT = "yyyy-mm-dd hh:mm:ss";

// SQL fragment that reads a `timestamp without time zone` column as wall-clock
// text, for excelDate(). Selecting the raw column instead would let node-pg
// read it in the server's time zone, and exceljs writes dates as UTC - a
// server outside UTC would shift every date by its offset.
export const sqlExcelTimestamp = (column: string) =>
  `TO_CHAR(${column}, 'YYYY-MM-DD"T"HH24:MI:SS')`;

// Turns sqlExcelTimestamp() text into a Date exceljs writes as the same
// wall-clock time, so Excel can sort, filter and format it as a date.
export const excelDate = (value: string | null | undefined): Date | null =>
  value ? new Date(`${value}Z`) : null;

// A file response, or the JSON error the client's export helper reads back
export const xlsxResponse = async (
  workbook: Workbook,
  filename: string,
  extraHeaders: Record<string, string> = {},
) => {
  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": XLSX_CONTENT_TYPE,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
};
