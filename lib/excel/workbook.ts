import { NextResponse } from "next/server";
import type { Workbook, Worksheet } from "exceljs";

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

// Excel refuses a cell longer than this
const EXCEL_CELL_MAX = 32_767;

export const excelText = (value: string | null | undefined) =>
  value && value.length > EXCEL_CELL_MAX
    ? `${value.slice(0, EXCEL_CELL_MAX - 1)}…`
    : (value ?? null);

// Header row colours: the app's near-black primary (neutral-900) with white text
const HEADER_FILL = "FF171717";
const HEADER_TEXT = "FFFFFFFF";

// Makes a data sheet easy to work with: a bold, dark header row that stays
// in view, Excel's filter buttons on every column, and wrapped text in the
// long columns (`wrapKeys`). Call after the columns and rows are added.
export const styleDataSheet = (worksheet: Worksheet, wrapKeys: string[] = []) => {
  // Before the header styling: a column's alignment covers its header cell too
  for (const key of wrapKeys) {
    worksheet.getColumn(key).alignment = { wrapText: true, vertical: "top" };
  }

  const header = worksheet.getRow(1);
  header.height = 22;
  // Per cell, so the colour stops at the last column instead of filling the row
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: HEADER_TEXT } };
    cell.alignment = { vertical: "middle" };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
  });

  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  const columnCount = worksheet.columnCount;
  if (columnCount > 0) {
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: Math.max(1, worksheet.rowCount), column: columnCount },
    };
  }
};

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
