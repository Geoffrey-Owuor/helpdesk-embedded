import { query } from "@/lib/Db";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/services/EmailService";
import {
  ReminderTemplate,
  UnresolvedIssue,
} from "@/templates/ReminderTemplate";

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
        const html = ReminderTemplate(task.nameOrDept, task.issues);

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
