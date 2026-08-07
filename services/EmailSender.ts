import { sendEmail } from "./EmailService";
import {
  generateIssueNotificationEmail,
  IssueEmailComment,
  IssueNotificationEmailParams,
} from "@/templates/IssueEmailTemplate";
import { getEmailData } from "./EmailData";
import { dateFormatter } from "@/public/assets";

type EmailSenderProps = {
  title: string;
  uuid: string;
  description: string;
  comment?: string;
  author?: string;
  reasonReopened?: string;
  reasonEscalated?: string;
  attachments?: {
    filename: string;
    content: string;
    contentType: string;
  }[];
  prevAgentEmail?: string;
};
export const emailSender = async ({
  title,
  uuid,
  description,
  comment = "",
  reasonReopened = "",
  reasonEscalated = "",
  author = "",
  attachments,
  prevAgentEmail,
}: EmailSenderProps) => {
  const commentData: IssueEmailComment | undefined = comment
    ? {
        author: author,
        content: comment,
        submittedAt: dateFormatter(new Date().toLocaleDateString()),
      }
    : undefined;

  // Getting the issue data for the email body
  const { issueData, emails, ccEmails, remarks } = await getEmailData(uuid);

  // Pass in the previous agent email to the array if provided
  const finalEmailArray = prevAgentEmail
    ? emails.includes(prevAgentEmail)
      ? emails
      : [...emails, prevAgentEmail]
    : emails;

  const emailParams: IssueNotificationEmailParams = {
    title: title,
    description: description,
    body: issueData,
    remarks: remarks,
    reasonReopened: reasonReopened,
    reasonEscalated: reasonEscalated,
    comment: commentData,
  };

  // Generate the html email template
  const emailHtml = generateIssueNotificationEmail(emailParams, uuid);

  //Sending the email
  await sendEmail({
    to: finalEmailArray,
    cc: ccEmails,
    subject: title,
    html: emailHtml,
    attachments: attachments,
  });
};
