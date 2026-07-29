import { abbreviateUserName } from "@/public/assets";
import { dateFormatter } from "@/public/assets";

type IssueEmailStatus = string;
type IssueEmailPriority = string;

export interface IssueEmailComment {
  author: string;
  content: string;
  submittedAt: string;
}

export interface IssueEmailBody {
  referenceNo: string;
  type: string;
  agent: string;
  date: string;
  priority: IssueEmailPriority;
  status: IssueEmailStatus;
  submitter: string;
  admin: string;
  issueTitle: string;
  issueDescription: string;
}

export interface IssueNotificationEmailParams {
  title: string;
  description: string;
  body: IssueEmailBody;
  comment?: IssueEmailComment;
  remarks?: string;
  reasonReopened?: string;
  reasonEscalated?: string;
}

// ─── Badge Configs ────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<
  IssueEmailStatus,
  { bg: string; color: string; label: string }
> = {
  open: {
    bg: "#fef9ec",
    color: "#92680a",
    label: "Open",
  },
  "in progress": {
    bg: "#EEF2FF",
    color: "#4338CA",
    label: "In Progress",
  },
  resolved: {
    bg: "#f0fdf4",
    color: "#166534",
    label: "Resolved",
  },
  closed: {
    bg: "#eff6ff",
    color: "#1d4ed8",
    label: "Closed",
  },
};

const PRIORITY_STYLES: Record<
  IssueEmailPriority,
  { bg: string; color: string; border: string }
> = {
  Low: { bg: "#f8fafc", color: "#475569", border: "#cbd5e1" },
  Medium: { bg: "#fffbeb", color: "#92400e", border: "#fcd34d" },
  High: { bg: "#fff7ed", color: "#c2410c", border: "#fb923c" },
  Critical: { bg: "#fef2f2", color: "#991b1b", border: "#f87171" },
};

// ─── Sub-renderers ────────────────────────────────────────────────────────────

export function renderStatusBadge(status: IssueEmailStatus): string {
  const s = STATUS_STYLES[status];
  return `
        <span style="
        display: inline-flex;
        align-items: center;
        justify-content: center; /* Ensures content is centered horizontally if width is fixed */
        gap: 6px;
        background: ${s.bg};
        color: ${s.color};
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.3px;
        padding: 4px 12px; /* Balanced padding */
        border-radius: 20px;
        white-space: nowrap;
        line-height: 1; /* Prevents text descent from pushing the box height */
      ">
        ${s.label}
      </span>
    `;
}

export function renderPriorityBadge(priority: IssueEmailPriority): string {
  const p = PRIORITY_STYLES[priority];
  return `
    <span style="
      display: inline-block;
      background: ${p.bg};
      color: ${p.color};
      border: 1px solid ${p.border};
      font-size: 12px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 4px;
      white-space: nowrap;
    ">${priority}</span>`;
}

function renderMetaRow(label: string, value: string): string {
  return `
    <tr>
      <td style="
        padding: 11px 16px;
        font-size: 12.5px;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        white-space: nowrap;
        width: 160px;
        vertical-align: top;
        border-bottom: 1px solid #f3f4f6;
      ">${label}</td>
      <td style="
        padding: 11px 16px;
        font-size: 13.5px;
        color: #111827;
        border-bottom: 1px solid #f3f4f6;
        vertical-align: top;
      ">${value}</td>
    </tr>`;
}

function renderMessageSection(label: string, text: string): string {
  return `
    <!-- Message Section -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px;">
      <tr>
        <td>
          <!-- Section Header -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 14px;">
            <tr>
              <td style="
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #9ca3af;
                padding-bottom: 10px;
                border-bottom: 1px solid #e5e7eb;
              ">${label}</td>
            </tr>
          </table>

          <!-- Message Card -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
            background: #fffbeb;
            border: 1px solid #fcd34d;
            border-left: 3px solid #f59e0b;
            border-radius: 6px;
          ">
            <tr>
              <td style="padding: 14px 18px;">
                <p style="
                  font-size: 13.5px;
                  line-height: 1.65;
                  color: #374151;
                  margin: 0;
                  padding: 0;
                  overflow-wrap: break-word;
                  white-space: pre-wrap;
                ">${text}</p>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>`;
}

function renderCommentSection(comment: IssueEmailComment): string {
  const initials = abbreviateUserName(comment.author);

  return `
    <!-- Comment Section -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px;">
      <tr>
        <td>
          <!-- Section Header -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 14px;">
            <tr>
              <td style="
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #9ca3af;
                padding-bottom: 10px;
                border-bottom: 1px solid #e5e7eb;
              ">New Comment</td>
            </tr>
          </table>

          <!-- Comment Card -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-left: 3px solid #404040;
            border-radius: 6px;
          ">
            <tr>
              <td style="padding: 16px 18px;">
                <!-- Author row -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 10px;">
                  <tr>
                    <td style="width: 34px; vertical-align: middle;">
                      <div style="
                        width: 32px; height: 32px;
                        background: #262626;
                        color: #ffffff;
                        border-radius: 50%;
                        font-size: 12px;
                        font-weight: 700;
                        text-align: center;
                        line-height: 32px;
                        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                      ">${initials}</div>
                    </td>
                    <td style="padding-left: 10px; vertical-align: middle;">
                      <div style="font-size: 13.5px; font-weight: 600; color: #111827;">${comment.author}</div>
                      <div style="font-size: 11.5px; color: #9ca3af; margin-top: 1px;">${comment.submittedAt}</div>
                    </td>
                  </tr>
                </table>
                <!-- Comment body -->
                <p style="
                  font-size: 13.5px;
                  line-height: 1.65;
                  color: #374151;
                  margin: 0;
                  padding: 0;
                  overflow-wrap: break-word;
                  white-space: pre-wrap;
                ">${comment.content}</p>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>`;
}

// ─── Main Template ────────────────────────────────────────────────────────────

export function generateIssueNotificationEmail(
  params: IssueNotificationEmailParams,
  uuid: string,
): string {
  const {
    title,
    description,
    body,
    comment,
    remarks,
    reasonReopened,
    reasonEscalated,
  } = params;

  const issueLink = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/${uuid}?type=issue&title=${encodeURIComponent(body.issueTitle)}&description=${encodeURIComponent(body.issueDescription)}`;

  const statusBadge = renderStatusBadge(body.status);
  const priorityBadge = renderPriorityBadge(body.priority);
  const commentHtml = comment ? renderCommentSection(comment) : "";
  const remarksHtml = remarks ? renderMessageSection("Remarks", remarks) : "";
  const reasonHtml = reasonReopened
    ? renderMessageSection("Reason Reopened", reasonReopened)
    : "";
  const escalatedHtml = reasonEscalated
    ? renderMessageSection("Reason Escalated", reasonEscalated)
    : "";

  return `
 <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>${title}</title>
    <!--[if mso]>
    <noscript>
      <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
    </noscript>
    <![endif]-->
  </head>
  <body style="
    margin: 0;
    padding: 0;
    background-color: transparent;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  ">

    <!-- Outer wrapper -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center">

          <!-- Email card (max 620px) -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px;">

            <!-- ── HEADER ── -->
            <tr>
              <td style="
                background: #171717;
                padding: 20px;
                border-radius: 20px 20px 0 0;
              ">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                  <tr>
                    <td align="left" style="padding-right: 10px;">
                      <span style="
                        font-size: 20px;
                        font-weight: 600;
                        color: #ffffff;
                        letter-spacing: -0.3px;
                      ">Help<span style="color: #a3a3a3;">Desk</span></span>
                    </td>
                    
                    <td align="right" style="padding-left: 10px;">
                      <span style="
                        font-size: 11px;
                        font-weight: 600;
                        color: #737373;
                        letter-spacing: 0.5px;
                        text-transform: uppercase;
                      ">Notification</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- ── BODY ── -->
            <tr>
              <td style="
                background: #ffffff;
                padding: 24px 0px;
              ">

                <!-- Title & Description -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                  <tr>
                    <td>
                      <h1 style="
                        font-size: 20px;
                        font-weight: 700;
                        color: #111827;
                        margin: 0 0 10px 0;
                        letter-spacing: -0.3px;
                        line-height: 1.3;
                      ">${title}</h1>
                      <p style="
                        font-size: 14px;
                        line-height: 1.6;
                        color: #6b7280;
                        margin: 0;
                      ">${description}</p>
                    </td>
                  </tr>
                </table>

                <!-- Optional Issue Remarks Section -->
                ${remarksHtml}

                <!-- Optional Comment Section -->
                ${commentHtml}

                <!-- Optional Reason Reopened Section -->
                ${reasonHtml}

                <!-- Optional Reason Escalated Section -->
                ${escalatedHtml}

              
                <!-- View Issue Button -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px; margin-bottom:24px;">
                  <tr>
                    <td align="center">
                      <a href="${issueLink}" style="
                        display: inline-block;
                        background: #171717;
                        color: #ffffff;
                        font-size: 13.5px;
                        font-weight: 600;
                        text-decoration: none;
                        padding: 12px 28px;
                        border-radius: 6px;
                        letter-spacing: 0.2px;
                      ">View Issue →</a>
                    </td>
                  </tr>
                </table>

                <!-- Section label: Issue Details -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 14px;">
                  <tr>
                    <td style="
                      font-size: 11px;
                      font-weight: 700;
                      text-transform: uppercase;
                      letter-spacing: 1px;
                      color: #9ca3af;
                    ">Issue Details</td>
                  </tr>
                </table>

                <!-- Metadata table -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
                  border: 1px solid #e5e7eb;
                  border-radius: 8px;
                  overflow: hidden;
                  border-collapse: separate;
                  border-spacing: 0;
                ">
                  ${renderMetaRow("Reference No.", `<span style="font-family: 'Courier New', monospace; font-size: 13px; color: #374151;">${body.referenceNo}</span>`)}
                  ${renderMetaRow("Type", body.type)}
                  ${renderMetaRow("Agent", body.agent)}
                  ${renderMetaRow("Priority", priorityBadge)}
                  ${renderMetaRow("Status", statusBadge)}
                  ${renderMetaRow("Submitter", body.submitter)}
                  ${renderMetaRow("Date Submitted", dateFormatter(body.date))}
                  ${renderMetaRow("Admin", body.admin)}
                  <tr>
                    <td colspan="2" style="
                      padding: 14px 16px 6px;
                      font-size: 12.5px;
                      font-weight: 600;
                      color: #6b7280;
                      text-transform: uppercase;
                      letter-spacing: 0.5px;
                    ">Issue Title</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="
                      padding: 4px 16px 16px;
                      font-size: 14px;
                      font-weight: 600;
                      color: #111827;
                      overflow-wrap: break-word;
                      white-space: pre-wrap;
                      border-bottom: 1px solid #f3f4f6;
                    ">${body.issueTitle}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="
                      padding: 14px 16px 6px;
                      font-size: 12.5px;
                      font-weight: 600;
                      color: #6b7280;
                      text-transform: uppercase;
                      letter-spacing: 0.5px;
                    ">Issue Description</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="
                      padding: 4px 16px 16px;
                      font-size: 13.5px;
                      line-height: 1.65;
                      color: #374151;
                      overflow-wrap: break-word;
                      white-space: pre-wrap;
                    ">${body.issueDescription}</td>
                  </tr>
                </table>

                <!-- ── FOOTER ── -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 36px;">
                  <tr>
                    <td align="center">
                      <p style="
                        font-size: 12px;
                        color: #9ca3af;
                        margin: 0 0 4px;
                      ">This is an automated notification from</p>
                      <p style="
                        font-size: 13px;
                        font-weight: 700;
                        color: #404040;
                        margin: 0 0 12px;
                        letter-spacing: -0.2px;
                      ">HelpDesk</p>
                      <p style="
                        font-size: 11.5px;
                        color: #d1d5db;
                        margin: 0;
                      ">Please do not reply to this email directly.</p>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <!-- Bottom spacer -->
            <tr>
              <td style="padding-top: 20px; padding-bottom:14px;" align="center">
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
  </html>
  `;
}
