import { query } from "@/lib/Db";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/services/EmailService";
import {
  ReminderTemplate,
  UnresolvedIssue,
} from "@/templates/ReminderTemplate";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!email) {
    return NextResponse.json({ error: "Email not provided" }, { status: 400 });
  }

  const unresolvedQuery = `
      SELECT 
        issue_uuid, issue_reference_id, issue_submitter_name, issue_submitter_department,
        issue_target_department, issue_priority, issue_type, issue_title, issue_description, 
        issue_status, issue_agent_name, issue_agent_email, issue_created_at, issue_updated_at
      FROM issues_table
      WHERE issue_status != $1
        AND issue_status != $2
        AND issue_agent_email = $3
        AND issue_created_at <= NOW() - INTERVAL '7 days'
    `;

  try {
    const issuesResult = await query<UnresolvedIssue>(unresolvedQuery, [
      "resolved",
      "closed",
      email,
    ]);

    if (issuesResult.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: `No unresolved issues found for agent: ${email}`,
        },
        { status: 200 },
      );
    }

    // Generate reminder template
    const html = ReminderTemplate(
      issuesResult[0].issue_agent_name,
      issuesResult,
    );

    //  Send the email
    await sendEmail({
      to: email,
      subject: `[HelpDesk] ${issuesResult.length} Unresolved Issue${issuesResult.length !== 1 ? "s" : ""} - Action Required`,
      html: html,
    });

    // Response
    const summary = {
      recipient: email,
      type: "Single agent reminder",
      sent: true,
      count: issuesResult.length,
    };

    return NextResponse.json(
      { success: true, summary: summary },
      { status: 200 },
    );
  } catch (error) {
    console.error("[reminder-cron] Fatal error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
