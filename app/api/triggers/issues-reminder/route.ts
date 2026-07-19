import { query } from "@/lib/Db";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/services/EmailService";
import {
  renderStatusBadge,
  renderPriorityBadge,
} from "@/templates/IssueEmailTemplate";
import { dateFormatter } from "@/public/assets";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UnresolvedIssue {
  issue_uuid: string;
  issue_reference_id: string;
  issue_submitter_name: string;
  issue_target_department: string;
  issue_submitter_department: string;
  issue_priority: string;
  issue_type: string;
  issue_title: string;
  issue_description: string;
  issue_status: string;
  issue_agent_name: string;
  issue_agent_email: string;
  issue_created_at: string;
  issue_updated_at: string;
}

// ─── Issue Card ────────────────────────────────────────────────────────────────

function renderIssueRow(issue: UnresolvedIssue): string {
  const daysSince = Math.floor(
    (Date.now() - new Date(issue.issue_created_at).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  // Building the issue uuid link
  const issueLink = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/${issue.issue_uuid}?type=issue&title=${encodeURIComponent(issue.issue_title)}&description=${encodeURIComponent(issue.issue_description)}`;

  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    ">
      <tr>
        <td style="padding: 24px;">
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
            <tr>
              <td align="left" valign="middle">
                <span style="font-family: 'Courier New', monospace; font-size: 13px; font-weight: 600; color: #6b7280; background: #f3f4f6; padding: 4px 8px; border-radius: 6px;">
                  ${issue.issue_reference_id}
                </span>
              </td>
              <td align="right" valign="middle">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding-right: 8px;">
                      ${renderPriorityBadge(issue.issue_priority)}
                    </td>
                    <td>
                      ${renderStatusBadge(issue.issue_status)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <h3 style="margin: 0 0 8px 0; font-size: 17px; font-weight: 700; color: #111827; line-height: 1.4;">
            ${issue.issue_title}
          </h3>
          <p style="margin: 0 0 20px 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
            ${issue.issue_description || "<em style='color: #9ca3af;'>No description provided</em>"}
          </p>

          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
            <tr>
              <td align="left" style="border-radius: 6px; background-color: #111827;">
                <a href="${issueLink}" target="_blank" style="display: inline-block; padding: 10px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px; text-align: center;">
                  View Issue &rarr;
                </a>
              </td>
            </tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
            background-color: #f9fafb;
            border: 1px solid #f3f4f6;
            border-radius: 8px;
            padding: 16px;
          ">
            <tr>
              <td width="50%" valign="top" style="padding-right: 10px;">
                <div style="margin-bottom: 10px;">
                  <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; display: block; margin-bottom: 2px;">Submitter</span>
                  <span style="font-size: 13px; font-weight: 500; color: #1f2937;">${issue.issue_submitter_name}</span>
                </div>
                <div style="margin-bottom: 10px;">
                  <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; display: block; margin-bottom: 2px;">Assigned Agent</span>
                  <span style="font-size: 13px; font-weight: 500; color: #1f2937;">${issue.issue_agent_name || "Unassigned"}</span>
                </div>
                <div>
                  <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; display: block; margin-bottom: 2px;">Category</span>
                  <span style="font-size: 13px; font-weight: 500; color: #1f2937;">${issue.issue_type}</span>
                </div>
              </td>
              
              <td width="50%" valign="top">
                <div style="margin-bottom: 10px;">
                  <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; display: block; margin-bottom: 2px;">Created At</span>
                  <span style="font-size: 13px; font-weight: 500; color: #1f2937;">${dateFormatter(issue.issue_created_at)}</span>
                </div>
                <div style="margin-bottom: 10px;">
                  <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; display: block; margin-bottom: 2px;">Last Updated</span>
                  <span style="font-size: 13px; font-weight: 500; color: #1f2937;">${dateFormatter(issue.issue_updated_at)}</span>
                </div>
                <div>
                  <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; display: block; margin-bottom: 2px;">Issue Age</span>
                  <span style="font-size: 13px; font-weight: 700; color: #dc2626;">${daysSince} Days Unresolved</span>
                </div>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>`;
}

// ─── Email Template ───────────────────────────────────────────────────────────

function generateReminderEmail(
  agent: string,
  issues: UnresolvedIssue[],
): string {
  const issueCards = issues.map((issue) => renderIssueRow(issue)).join("");
  const criticalCount = issues.filter(
    (i) => i.issue_priority === "Critical",
  ).length;
  const highCount = issues.filter((i) => i.issue_priority === "High").length;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unresolved Issues Reminder</title>
</head>
<body style="
  margin: 0; padding: 0;
  background-color: transparent;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
">

  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 680px;">

          <tr>
            <td style="
              background: #171717;
              padding: 20px;
              border-radius: 20px 20px 0 0;
            ">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left">
                    <span style="
                      font-size: 20px;
                      font-weight: 600;
                      color: #ffffff;
                      letter-spacing: -0.3px;
                    ">Help<span style="color: #a3a3a3;">Desk</span></span>
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


          <tr>
            <td style="
              background: #ffffff;
              padding: 24px 0px;
            ">

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-left: 4px solid #dc2626;
                border-radius: 8px;
                margin-bottom: 32px;
              ">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="font-size: 14px; font-weight: 700; color: #991b1b; margin-bottom: 6px;">
                      Issues Unresolved after 7 days
                    </div>
                    <p style="font-size: 13.5px; color: #b91c1c; margin: 0; line-height: 1.5;">
                      <strong>${agent}</strong> has <strong>${issues.length} unresolved issue${issues.length !== 1 ? "s" : ""}</strong>
                      that ${issues.length !== 1 ? "have" : "has"} not been resolved after 7 days.
                      ${criticalCount > 0 ? `<br><span style="margin-top: 6px; display: inline-block;">${criticalCount} Critical and ${highCount} High priority issue${criticalCount + highCount !== 1 ? "s" : ""} need immediate action.</span>` : ""}
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="
                    font-size: 12px; font-weight: 700;
                    text-transform: uppercase; letter-spacing: 1px;
                    color: #9ca3af; padding-bottom: 12px;
                    border-bottom: 2px solid #f3f4f6;
                  ">Open Issues - ${agent}</td>
                </tr>
              </table>

              ${issueCards}

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 40px; border-top: 1px solid #f3f4f6; padding-top: 24px;">
                <tr>
                  <td align="center">
                    <p style="font-size: 12px; color: #9ca3af; margin: 0 0 4px;">This is an automated reminder from</p>
                    <p style="font-size: 13px; font-weight: 700; color: #404040; margin: 0 0 12px; letter-spacing: -0.2px;">HelpDesk</p>
                    <p style="font-size: 11.5px; color: #d1d5db; margin: 0;">Please do not reply to this email directly.</p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <tr>
            <td style="padding-top: 24px;" align="center">
              <p style="font-size: 11px; color: #9ca3af; margin: 0;">
                © ${new Date().getFullYear()} HelpDesk. All rights reserved.
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

// 1. Helper function to create a delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch group emails so we know where to send the department summaries
    const groupEmailsResult = await query<{
      department: string;
      emails: string;
    }>(`SELECT department, emails FROM group_emails`);

    // Convert to an easily searchable object: { "IT": "it@domain.com", "HR": "hr@domain.com" }
    const groupEmailsMap = groupEmailsResult.reduce(
      (acc, curr) => {
        acc[curr.department] = curr.emails;
        return acc;
      },
      {} as Record<string, string>,
    );

    // 2. Fetch ALL unresolved issues older than 7 days
    // Notice we removed the "issue_agent_email IS NOT NULL" filter
    // so we can catch unassigned issues for the department summary
    // We also added issue_target_department to the SELECT clause
    const unresolvedQuery = `
      SELECT 
        issue_uuid, issue_reference_id, issue_submitter_name, issue_submitter_department,
        issue_target_department, issue_priority, issue_type, issue_title, issue_description, 
        issue_status, issue_agent_name, issue_agent_email, issue_created_at, issue_updated_at
      FROM issues_table
      WHERE issue_status != $1
        AND issue_status != $2
        AND issue_created_at <= NOW() - INTERVAL '7 days'
    `;

    const allIssues = await query<UnresolvedIssue>(unresolvedQuery, [
      "resolved",
      "closed",
    ]);

    if (allIssues.length === 0) {
      return NextResponse.json(
        { success: true, message: "No unresolved issues found." },
        { status: 200 },
      );
    }

    // 3. Group the issues two ways: by Agent and by Department
    const issuesByAgent: Record<string, typeof allIssues> = {};
    const issuesByDepartment: Record<string, typeof allIssues> = {};

    allIssues.forEach((issue) => {
      // Group for specific agents (only if the issue is actually assigned)
      if (issue.issue_agent_email) {
        if (!issuesByAgent[issue.issue_agent_email])
          issuesByAgent[issue.issue_agent_email] = [];
        issuesByAgent[issue.issue_agent_email].push(issue);
      }

      // Group for department summary
      const dept = issue.issue_target_department;
      if (dept) {
        if (!issuesByDepartment[dept]) issuesByDepartment[dept] = [];
        issuesByDepartment[dept].push(issue);
      }
    });

    // 4. Build a unified "Queue" of emails to send
    // This allows us to loop through both agents and departments cleanly
    const emailTasks = [];

    // Add Agent tasks
    for (const [agentEmail, issues] of Object.entries(issuesByAgent)) {
      emailTasks.push({
        to: agentEmail,
        subject: `[HelpDesk] ${issues.length} Unresolved Issue${issues.length !== 1 ? "s" : ""} - Action Required`,
        nameOrDept: issues[0].issue_agent_name || "Agent",
        issues,
        type: "Agent",
      });
    }

    // Add Department tasks
    for (const [dept, issues] of Object.entries(issuesByDepartment)) {
      const groupEmail = groupEmailsMap[dept];
      if (groupEmail) {
        emailTasks.push({
          to: groupEmail,
          subject: `[HelpDesk] ${issues.length} Unresolved Issue${issues.length !== 1 ? "s" : ""} - ${dept} Summary`,
          nameOrDept: dept,
          issues,
          type: "Department",
        });
      }
    }

    // 5. Send everything sequentially with our 3-second delay
    const summary = [];

    for (let i = 0; i < emailTasks.length; i++) {
      const task = emailTasks[i];

      try {
        const html = generateReminderEmail(task.nameOrDept, task.issues);

        await sendEmail({
          to: task.to,
          subject: task.subject,
          html,
        });

        summary.push({
          recipient: task.to,
          type: task.type,
          sent: true,
          count: task.issues.length,
        });
      } catch (error) {
        console.error(`[reminder-cron] Failed to send to ${task.to}:`, error);
        summary.push({
          recipient: task.to,
          type: task.type,
          sent: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }

      // Apply delay, skipping it on the final iteration
      if (i < emailTasks.length - 1) {
        await delay(3000);
      }
    }

    return NextResponse.json({ success: true, summary }, { status: 200 });
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
