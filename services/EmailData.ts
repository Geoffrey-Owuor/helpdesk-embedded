import { query } from "@/lib/Db";
import { IssueEmailBody } from "@/templates/IssueEmailTemplate";

interface EmailData {
  issueData: IssueEmailBody;
  emails: string[];
  ccEmails?: string;
}

export const getEmailData = async (uuid: string): Promise<EmailData> => {
  const baseQuery = `
    SELECT issue_reference_id, issue_target_department, issue_type, issue_agent_name,
    issue_priority, issue_status, issue_submitter_name,
    issue_assigner_name, issue_title, issue_description,
    issue_submitter_email, issue_agent_email, issue_assigner_email
    FROM issues_table WHERE issue_uuid = $1
    `;

  const result = await query(baseQuery, [uuid]);
  const emailData = result[0];

  // The group emails query
  const ccEmailsQuery = await query(
    `SELECT emails FROM group_emails WHERE department = $1 LIMIT 1`,
    [emailData.issue_target_department],
  );

  const ccEmails =
    ccEmailsQuery.length > 0 ? ccEmailsQuery[0].emails : undefined;

  const issueData: IssueEmailBody = {
    referenceNo: emailData.issue_reference_id,
    type: emailData.issue_type,
    agent: emailData.issue_agent_name,
    priority: emailData.issue_priority,
    status: emailData.issue_status,
    submitter: emailData.issue_submitter_name,
    admin: emailData.issue_assigner_name,
    issueTitle: emailData.issue_title,
    issueDescription: emailData.issue_description,
  };

  // ADDITION - IT Related Emails to be routed through the IT Group Email
  // THEY WILL HAVE TO DECIDE ON THAT PART

  // Getting an array of unique emails without any falsy values
  const issueEmails = [
    ...new Set([
      emailData.issue_submitter_email,
      emailData.issue_agent_email,
      emailData.issue_assigner_email,
    ]),
  ].filter(Boolean);

  return {
    issueData: issueData,
    emails: issueEmails,
    ccEmails: ccEmails,
  };
};
