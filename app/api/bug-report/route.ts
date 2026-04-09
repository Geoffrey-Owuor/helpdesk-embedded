import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/Db";

export async function POST(request: NextRequest) {
  try {
    // Our parameters
    const {
      title,
      category,
      severity,
      steps,
      expected,
      actual,
      browserOs,
      extras,
    } = await request.json();

    const baseQuery = `
         INSERT INTO bug_reports 
         (bug_title, bug_category, bug_severity, reproduction_steps, expected_behavior, actual_behavior, browser_os, additional_context)
         VALUES
         ($1, $2, $3, $4, $5, $6, $7, $8)
        `;

    const baseParams = [
      title,
      category,
      severity,
      steps,
      expected,
      actual,
      browserOs,
      extras,
    ];

    // Execute the query and return a response
    await query(baseQuery, baseParams);

    return NextResponse.json(
      { message: "Thank you for helping us improve the product!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while trying to submit a bug report:", error);
    return NextResponse.json(
      { message: "Could not submit report, an error occured" },
      { status: 500 },
    );
  }
}
