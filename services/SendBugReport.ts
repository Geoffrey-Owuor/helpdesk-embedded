import { BugReportTemplate } from "@/templates/BugReportTemplate";
import { sendEmail } from "./EmailService";

export type BugReportProps = {
  title: string;
  category: string;
  dateReported: string;
  severity: string;
};
export const SendBugReport = async (bugReportInfo: BugReportProps) => {
  // Get the email template
  const emailTemplate = BugReportTemplate(bugReportInfo);

  // Send the email
  await sendEmail({
    to: "geoffrey@hotpoint.co.ke",
    subject: "New Bug Report Submitted",
    html: emailTemplate,
  });
};
