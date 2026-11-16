import { NextResponse } from "next/server";
import { Workbook } from "exceljs";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { pool } from "@/lib/Db";
import { loadDepartments } from "@/lib/departments";
import { revalidateCompanyRecords } from "@/lib/companyRecords";
import {
  IMPORT_MAX_BYTES,
  ImportRow,
  parseImportWorkbook,
} from "@/lib/excel/companyRecordsImport";

type RowAction = "new" | "updated" | "reactivated" | "unchanged";

// Changed rows shown in the preview; the summary counts all of them
const MAX_PREVIEW_ROWS = 100;

const fileProblem = (message: string, status = 400) =>
  NextResponse.json({ message }, { status });

// What importing each row would do to the records as they are now
const planImport = async (rows: ImportRow[]) => {
  const { rows: existing } = await pool.query(
    `SELECT email, name, department, is_active AS "isActive"
     FROM company_user_records WHERE email = ANY($1::text[])`,
    [rows.map((row) => row.email)],
  );
  const byEmail = new Map(existing.map((record) => [record.email, record]));

  const summary = { total: rows.length, new: 0, updated: 0, reactivated: 0, unchanged: 0 };
  const changes = [];

  for (const row of rows) {
    const record = byEmail.get(row.email);
    let action: RowAction = "new";
    if (record) {
      const sameDetails =
        record.name === row.name && record.department === row.department;
      action = !record.isActive
        ? "reactivated"
        : sameDetails
          ? "unchanged"
          : "updated";
    }
    summary[action]++;

    if (action !== "unchanged" && changes.length < MAX_PREVIEW_ROWS) {
      changes.push({
        ...row,
        action,
        previousName: record && record.name !== row.name ? record.name : null,
        previousDepartment:
          record && record.department !== row.department
            ? record.department
            : null,
      });
    }
  }

  return { summary, changes };
};

// Bulk import of staff records from the Excel template
// (lib/excel/companyRecordsImport.ts has the rules). mode=validate reports
// what the file would do; mode=commit checks the file again and writes it.
// The client sends the same file both times, so nothing is trusted from the
// first call. A file with any problem imports nothing.
export const POST = withAuth(async ({ user, request }) => {
  if (!user.isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const commit = formData.get("mode") === "commit";

    if (!(file instanceof File) || file.size === 0) {
      return fileProblem("Choose the filled-in template to import");
    }

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      return fileProblem("The file must be an Excel .xlsx file");
    }

    if (file.size > IMPORT_MAX_BYTES) {
      return fileProblem(
        `The file is larger than ${IMPORT_MAX_BYTES / 1024 / 1024} MB`,
      );
    }

    const workbook = new Workbook();
    try {
      await workbook.xlsx.load(await file.arrayBuffer());
    } catch {
      return fileProblem(
        "The file could not be read. Save it as .xlsx from the template and try again",
      );
    }

    const { rows, issues, issueCount } = parseImportWorkbook(
      workbook,
      await loadDepartments(),
    );

    if (issueCount > 0) {
      return NextResponse.json(
        {
          valid: false,
          issues,
          issueCount,
          message: "The file has problems, nothing was imported",
        },
        { status: commit ? 422 : 200 },
      );
    }

    const plan = await planImport(rows);

    if (!commit) {
      return NextResponse.json({ valid: true, ...plan }, { status: 200 });
    }

    // One statement, so it is all or nothing. Rows that already match are
    // left untouched (no updated_at change).
    const { rows: written } = await pool.query(
      `INSERT INTO company_user_records
       (name, email, department, updated_at, updated_by)
       SELECT t.name, t.email, t.department, NOW(), $4
       FROM UNNEST($1::text[], $2::text[], $3::text[])
         AS t(name, email, department)
       ON CONFLICT (email) DO UPDATE
       SET name = EXCLUDED.name, department = EXCLUDED.department,
       is_active = TRUE, updated_at = NOW(), updated_by = EXCLUDED.updated_by
       WHERE (company_user_records.name, company_user_records.department,
              company_user_records.is_active)
         IS DISTINCT FROM (EXCLUDED.name, EXCLUDED.department, TRUE)
       RETURNING (xmax = 0) AS inserted`,
      [
        rows.map((row) => row.name),
        rows.map((row) => row.email),
        rows.map((row) => row.department),
        user.userId,
      ],
    );

    const added = written.filter((row) => row.inserted).length;
    const updated = written.length - added;

    if (written.length > 0) revalidateCompanyRecords();

    return NextResponse.json(
      {
        valid: true,
        message:
          written.length === 0
            ? "The records already match the file, nothing changed"
            : `Import complete: ${added} added, ${updated} updated`,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while importing company user records:", error);
    return NextResponse.json(
      { message: "Error while trying to import the staff records" },
      { status: 500 },
    );
  }
});
