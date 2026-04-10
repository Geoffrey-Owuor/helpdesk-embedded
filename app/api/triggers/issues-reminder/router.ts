import { query } from "@/lib/Db";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/services/EmailService";
import { renderStatusBadge } from "@/templates/IssueEmailTemplate";
import { renderPriorityBadge } from "@/templates/IssueEmailTemplate";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UnresolvedIssue {
  issue_reference_id: string;
  issue_submitter_name: string;
  issue_submitter_department: string;
  issue_priority: string;
  issue_type: string;
  issue_title: string;
  issue_status: string;
  issue_agent_name: string;
  issue_created_at: string;
}

// ─── Issue Row ────────────────────────────────────────────────────────────────

function renderIssueRow(issue: UnresolvedIssue, index: number): string {
  const isEven = index % 2 === 0;
  const daysSince = Math.floor(
    (Date.now() - new Date(issue.issue_created_at).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return `
    <tr style="background: ${isEven ? "#ffffff" : "#f9fafb"};">
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; vertical-align: top;">
        <span style="font-family: 'Courier New', monospace; font-size: 12px; color: #374151;">
          ${issue.issue_reference_id}
        </span>
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; vertical-align: top;">
        <div style="font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 3px;">
          ${issue.issue_title}
        </div>
        <div style="font-size: 11.5px; color: #9ca3af;">
          ${issue.issue_type} · ${issue.issue_submitter_name}
        </div>
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; vertical-align: top; text-align: center;">
        ${renderPriorityBadge(issue.issue_priority)}
        <div style="margin-top: 5px;">
          ${renderStatusBadge(issue.issue_status)}
        </div>
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; vertical-align: top; text-align: center;">
        <div style="font-size: 12px; font-weight: 600; color: #c2410c;">${daysSince}d</div>
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; vertical-align: top;">
        <div style="font-size: 12.5px; color: #374151;">${issue.issue_agent_name}</div>
      </td>
    </tr>`;
}

// ─── Email Template ───────────────────────────────────────────────────────────

function generateReminderEmail(
  department: string,
  issues: UnresolvedIssue[],
): string {
  const issueRows = issues.map((issue, i) => renderIssueRow(issue, i)).join("");
  const criticalCount = issues.filter(
    (i) => i.issue_priority === "Critical",
  ).length;
  const highCount = issues.filter((i) => i.issue_priority === "High").length;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unresolved Issues Reminder</title>
</head>
<body style="
  margin: 0; padding: 0;
  background-color: #f3f4f6;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 680px;">

          <!-- HEADER -->
          <tr>
            <td style="
              background: #171717;
              padding: 22px 32px;
              border-radius: 10px 10px 0 0;
            ">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left">
                    <span style="font-size: 18px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px;">
                      Issue<span style="color: #a3a3a3;">Desk</span>
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-size: 11px; font-weight: 600; color: #737373; letter-spacing: 0.5px; text-transform: uppercase;">
                      Reminder
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Accent bar -->
          <tr>
            <td style="height: 3px; background: linear-gradient(90deg, #dc2626 0%, #f87171 100%);"></td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="
              background: #ffffff;
              padding: 32px 32px 28px;
              border-radius: 0 0 10px 10px;
              border: 1px solid #e5e7eb;
              border-top: none;
            ">

              <!-- Alert banner -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-left: 3px solid #dc2626;
                border-radius: 6px;
                margin-bottom: 28px;
              ">
                <tr>
                  <td style="padding: 14px 18px;">
                    <div style="font-size: 13.5px; font-weight: 700; color: #991b1b; margin-bottom: 4px;">
                      ⚠ Issues Unresolved after 7 days
                    </div>
                    <p style="font-size: 13px; color: #b91c1c; margin: 0; line-height: 1.5;">
                      The <strong>${department}</strong> department has <strong>${issues.length} unresolved issue${issues.length !== 1 ? "s" : ""}</strong>
                      that ${issues.length !== 1 ? "have" : "has"} not been resolved after 7 days.
                      ${criticalCount > 0 ? `<br><span style="margin-top: 4px; display: inline-block;">${criticalCount} Critical and ${highCount} High priority issue${criticalCount + highCount !== 1 ? "s" : ""} need immediate action.</span>` : ""}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Section label -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 14px;">
                <tr>
                  <td style="
                    font-size: 11px; font-weight: 700;
                    text-transform: uppercase; letter-spacing: 1px;
                    color: #9ca3af; padding-bottom: 10px;
                    border-bottom: 1px solid #e5e7eb;
                  ">Pending Issues — ${department}</td>
                </tr>
              </table>

              <!-- Issues table -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                overflow: hidden;
                border-collapse: separate;
                border-spacing: 0;
              ">
                <!-- Table header -->
                <tr style="background: #f9fafb;">
                  <td style="padding: 10px 16px; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb;">Ref No.</td>
                  <td style="padding: 10px 16px; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb;">Issue</td>
                  <td style="padding: 10px 16px; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb; text-align: center;">Priority</td>
                  <td style="padding: 10px 16px; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb; text-align: center;">Age</td>
                  <td style="padding: 10px 16px; font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb;">Agent</td>
                </tr>
                ${issueRows}
              </table>

              <!-- FOOTER -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 36px; border-top: 1px solid #f3f4f6; padding-top: 22px;">
                <tr>
                  <td align="center">
                    <p style="font-size: 12px; color: #9ca3af; margin: 0 0 4px;">This is an automated reminder from</p>
                    <p style="font-size: 13px; font-weight: 700; color: #404040; margin: 0 0 12px; letter-spacing: -0.2px;">IssueDesk</p>
                    <p style="font-size: 11.5px; color: #d1d5db; margin: 0;">Please do not reply to this email directly.</p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Bottom spacer -->
          <tr>
            <td style="padding-top: 20px;" align="center">
              <p style="font-size: 11px; color: #9ca3af; margin: 0;">
                © ${new Date().getFullYear()} IssueDesk. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  // 1. Security Check: Ensure only your script can trigger this
  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const groupEmailsResult = await query<{
      emails: string;
      department: string;
    }>(`SELECT department, emails FROM group_emails`);

    const unresolvedQuery = `
      SELECT 
        issue_reference_id, issue_submitter_name, issue_submitter_department,
        issue_priority, issue_type, issue_title, issue_status,
        issue_agent_name, issue_created_at
      FROM issues_table
      WHERE issue_status != $1
        AND issue_status != $2
        AND issue_target_department = $3
        AND issue_created_at <= NOW() - INTERVAL '7 days'
    `;

    const results = await Promise.allSettled(
      groupEmailsResult.map(async ({ department, emails }) => {
        const issuesResult = await query<UnresolvedIssue>(unresolvedQuery, [
          "resolved",
          "unfeasible",
          department,
        ]);

        if (issuesResult.length === 0) return { department, sent: false };

        const html = generateReminderEmail(department, issuesResult);

        await sendEmail({
          to: emails,
          subject: `[IssueDesk] ${issuesResult.length} Unresolved Issue${issuesResult.length !== 1 ? "s" : ""} — ${department}`,
          html,
        });

        return { department, sent: true, count: issuesResult.length };
      }),
    );

    const summary = results.map((r) =>
      r.status === "fulfilled" ? r.value : { error: r.reason?.message },
    );

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error("[reminder-cron] Fatal error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
