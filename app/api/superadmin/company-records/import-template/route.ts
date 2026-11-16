import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { loadDepartments } from "@/lib/departments";
import { buildImportTemplate } from "@/lib/excel/companyRecordsImport";
import { xlsxResponse } from "@/lib/excel/workbook";

// The staff records import template, built on request so its department
// dropdown lists the departments that are active right now
export const GET = withAuth(async ({ user }) => {
  if (!user.isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const workbook = buildImportTemplate(await loadDepartments());
    return xlsxResponse(workbook, "staff_records_template.xlsx");
  } catch (error) {
    console.error("Failed to build the staff records template:", error);
    return NextResponse.json(
      { message: "Failed to build the import template" },
      { status: 500 },
    );
  }
});
