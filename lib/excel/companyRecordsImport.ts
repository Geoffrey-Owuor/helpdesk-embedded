// The staff records bulk import (super admin Staff Records modal): builds
// the Excel template and reads a filled-in one back. Server side only.
//
// The rules, also written on the template's Instructions sheet:
//   - a .xlsx made from the template: a "Staff Records" sheet whose first row
//     is Full Name | Email | Department
//   - every row needs all three; blank rows are skipped
//   - the department must be an active staff department (any case)
//   - an email may appear once in the file
//   - one problem anywhere and nothing is imported
// A row whose email already has a record updates that record (and activates
// it again); records that aren't in the file are left alone.
import { Workbook } from "exceljs";
import type { Department } from "@/lib/departments";
import {
  normalizeRecordEmail,
  normalizeRecordName,
} from "@/lib/companyRecords";
import { styleDataSheet } from "@/lib/excel/workbook";

export const IMPORT_SHEET = "Staff Records";
export const IMPORT_HEADERS = ["Full Name", "Email", "Department"] as const;
export const IMPORT_MAX_ROWS = 2000;
export const IMPORT_MAX_BYTES = 2 * 1024 * 1024;

// Problems listed back to the admin; the rest are only counted
const MAX_REPORTED_ISSUES = 200;

export interface ImportRow {
  // The row's number in the sheet, as Excel shows it
  row: number;
  name: string;
  email: string;
  department: string;
}

export interface ImportIssue {
  // 0 for a problem with the file as a whole
  row: number;
  column: string;
  message: string;
}

export interface ParsedImport {
  rows: ImportRow[];
  issues: ImportIssue[];
  issueCount: number;
}

const INSTRUCTIONS = [
  "How to fill in this file",
  "",
  `1. Go to the "${IMPORT_SHEET}" sheet and add one person per row, starting on row 2.`,
  "2. Fill in all three columns for every person:",
  "      Full Name - the person's name as it should appear in HelpDesk.",
  "      Email - their work email address. Each email may appear only once in the file.",
  '      Department - pick it from the dropdown. It must be one of the departments on the "Departments" sheet.',
  "3. Save the file as .xlsx and upload it in HelpDesk: Super Admin > Staff Records > Import.",
  "",
  "What the import does",
  "",
  "- HelpDesk checks the whole file first and shows what it found. Nothing is saved until you confirm.",
  "- If any row has a problem, nothing is imported. Fix the rows listed and upload the file again.",
  "- A new email adds a staff record.",
  "- An email that already has a staff record updates that record's name and department. If the record was deactivated, it is activated again.",
  "- Staff records that are not in this file are left as they are. To deactivate someone, use the Staff Records list.",
  "- The import never creates, changes or deactivates a HelpDesk account.",
  "",
  "Rules",
  "",
  `- Do not rename the "${IMPORT_SHEET}" sheet or change, move or add to its header row.`,
  "- Blank rows are skipped. Spaces around a value are removed and emails are saved in lowercase.",
  `- At most ${IMPORT_MAX_ROWS} people and ${IMPORT_MAX_BYTES / 1024 / 1024} MB per file.`,
  "- Only the first three columns are read; anything else on the sheet is ignored.",
];

// A fresh template, with the departments that can be used right now
export const buildImportTemplate = (departments: Department[]): Workbook => {
  const active = departments.filter((department) => department.isActive);
  const workbook = new Workbook();

  const instructions = workbook.addWorksheet("Instructions");
  instructions.getColumn(1).width = 120;
  instructions.addRows(INSTRUCTIONS.map((line) => [line]));
  instructions.eachRow((row) => {
    const text = row.getCell(1).text;
    const isHeading = !!text && !/^[\d\s-]/.test(text);
    row.getCell(1).font = { bold: isHeading, size: isHeading ? 12 : 11 };
    row.getCell(1).alignment = { wrapText: true, vertical: "top" };
  });

  const records = workbook.addWorksheet(IMPORT_SHEET);
  records.columns = [
    { header: IMPORT_HEADERS[0], key: "name", width: 32 },
    { header: IMPORT_HEADERS[1], key: "email", width: 38 },
    { header: IMPORT_HEADERS[2], key: "department", width: 28 },
  ];
  styleDataSheet(records);

  const list = workbook.addWorksheet("Departments");
  list.columns = [{ header: "Department", key: "name", width: 32 }];
  list.addRows(active.map((department) => ({ name: department.name })));
  styleDataSheet(list);

  if (active.length > 0) {
    const range = `Departments!$A$2:$A$${active.length + 1}`;
    for (let row = 2; row <= IMPORT_MAX_ROWS + 1; row++) {
      records.getCell(row, 3).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [range],
        showErrorMessage: true,
        errorTitle: "Unknown department",
        error: 'Pick a department from the list (see the "Departments" sheet).',
      };
    }
  }

  return workbook;
};

// Reads a filled-in template. Every problem is collected rather than
// stopping at the first, so one upload shows everything to fix.
export const parseImportWorkbook = (
  workbook: Workbook,
  departments: Department[],
): ParsedImport => {
  const rows: ImportRow[] = [];
  const issues: ImportIssue[] = [];
  let issueCount = 0;

  const report = (row: number, column: string, message: string) => {
    issueCount++;
    if (issues.length < MAX_REPORTED_ISSUES) {
      issues.push({ row, column, message });
    }
  };

  const sheet = workbook.getWorksheet(IMPORT_SHEET);

  if (!sheet) {
    report(
      0,
      "File",
      `The file has no "${IMPORT_SHEET}" sheet. Download the template and fill that in.`,
    );
    return { rows, issues, issueCount };
  }

  // exceljs's cell.text flattens rich text, formula results and the
  // hyperlinks Excel makes of email addresses
  const textAt = (row: number, column: number) =>
    (sheet.getCell(row, column).text ?? "").trim();

  IMPORT_HEADERS.forEach((header, index) => {
    const found = textAt(1, index + 1);
    if (found.toLowerCase() !== header.toLowerCase()) {
      report(
        1,
        header,
        `Column ${String.fromCharCode(65 + index)} of the header row should be "${header}"${found ? `, not "${found}"` : ""}.`,
      );
    }
  });

  if (issueCount > 0) return { rows, issues, issueCount };

  const departmentsByName = new Map(
    departments.map((department) => [department.name.toLowerCase(), department]),
  );
  const firstRowByEmail = new Map<string, number>();
  let filled = 0;

  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
    const rawName = textAt(rowNumber, 1);
    const rawEmail = textAt(rowNumber, 2);
    const rawDepartment = textAt(rowNumber, 3);

    if (!rawName && !rawEmail && !rawDepartment) continue;

    filled++;
    if (filled > IMPORT_MAX_ROWS) continue;

    const name = normalizeRecordName(rawName);
    if (!name) {
      report(
        rowNumber,
        IMPORT_HEADERS[0],
        rawName ? "The name is longer than 255 characters." : "The name is missing.",
      );
    }

    const email = normalizeRecordEmail(rawEmail);
    if (!email) {
      report(
        rowNumber,
        IMPORT_HEADERS[1],
        rawEmail
          ? `"${rawEmail}" is not a valid email address.`
          : "The email is missing.",
      );
    } else {
      const firstRow = firstRowByEmail.get(email);
      if (firstRow) {
        report(
          rowNumber,
          IMPORT_HEADERS[1],
          `${email} is already on row ${firstRow}. An email may appear once.`,
        );
      } else {
        firstRowByEmail.set(email, rowNumber);
      }
    }

    const department = departmentsByName.get(
      rawDepartment.replace(/\s+/g, " ").toLowerCase(),
    );
    if (!rawDepartment) {
      report(rowNumber, IMPORT_HEADERS[2], "The department is missing.");
    } else if (!department) {
      report(
        rowNumber,
        IMPORT_HEADERS[2],
        `"${rawDepartment}" is not in the Departments list.`,
      );
    } else if (!department.isActive) {
      report(
        rowNumber,
        IMPORT_HEADERS[2],
        `${department.name} is an inactive department.`,
      );
    }

    if (name && email && department?.isActive) {
      rows.push({ row: rowNumber, name, email, department: department.name });
    }
  }

  if (filled === 0) {
    report(0, "File", `The "${IMPORT_SHEET}" sheet has no rows to import.`);
  } else if (filled > IMPORT_MAX_ROWS) {
    report(
      0,
      "File",
      `The file has ${filled} rows. Import at most ${IMPORT_MAX_ROWS} at a time.`,
    );
  }

  return { rows, issues, issueCount };
};
