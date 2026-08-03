import { dateFormatter } from "@/public/assets";
import { renderStatusBadge, renderPriorityBadge } from "./IssueEmailTemplate";

export interface UnresolvedIssue {
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

          <h3 style="margin: 0 0 8px 0; font-size: 17px; font-weight: 700; color: #111827; line-height: 1.4; overflow-wrap: break-word; white-space: pre-wrap;">
            ${issue.issue_title}
          </h3>
          <p style="margin: 0 0 20px 0; font-size: 14px; color: #4b5563; line-height: 1.6; overflow-wrap: break-word; white-space: pre-wrap;">
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

export function ReminderTemplate(
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
                  ">Unresolved Issues - ${agent}</td>
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
