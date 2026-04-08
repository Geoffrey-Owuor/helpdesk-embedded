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
};
export const emailSender = async ({
  title,
  uuid,
  description,
  comment = "",
  author = "",
}: EmailSenderProps) => {
  // Constructing our comment data
  const formattedDate = dateFormatter(new Date().toLocaleDateString());

  const commentData: IssueEmailComment | undefined = comment
    ? { author: author, content: comment, submittedAt: formattedDate }
    : undefined;

  // Getting the issue data for the email body
  const { issueData, emails, ccEmails, remarks } = await getEmailData(uuid);

  const emailParams: IssueNotificationEmailParams = {
    title: title,
    description: description,
    body: issueData,
    remarks: remarks,
    comment: commentData,
  };

  // Generate the html email template
  const emailHtml = generateIssueNotificationEmail(emailParams);

  //Sending the email
  await sendEmail({
    to: emails,
    cc: ccEmails,
    subject: title,
    html: emailHtml,
  });
};
