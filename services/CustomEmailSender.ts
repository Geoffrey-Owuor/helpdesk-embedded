import { sendGraphMail } from "./GraphMailClient";

export interface CustomEmailOptions {
  from: string; // The dynamically provided sender address
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    content: string; // Base64
    contentType: string;
  }[];
}

// PostMail's sender - an explicit admin action, so it ignores
// NOTIFICATION_EMAILS_ENABLED and always sends
export const sendCustomGraphEmail = async ({
  from,
  to,
  cc = [],
  bcc = [],
  subject,
  html,
  attachments = [],
}: CustomEmailOptions) => {
  try {
    // Map arrays to Microsoft Graph recipient format
    const formatRecipients = (emails: string[]) =>
      emails.map((email) => ({ emailAddress: { address: email } }));

    // Format attachments
    const formattedAttachments = attachments.map((file) => ({
      "@odata.type": "#microsoft.graph.fileAttachment",
      name: file.filename,
      contentType: file.contentType,
      contentBytes: file.content,
    }));

    const emailPayload = {
      message: {
        subject: subject,
        body: { contentType: "HTML", content: html },
        toRecipients: formatRecipients(to),
        ccRecipients: formatRecipients(cc),
        bccRecipients: formatRecipients(bcc),
        attachments: formattedAttachments,
      },
      saveToSentItems: "true",
    };

    // Retries throttling, network failures and 5xx - see GraphMailClient.ts
    await sendGraphMail(from, emailPayload, subject);
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(
      `Custom Graph Email failed: from: ${from}, "${subject}" to ${to.join(", ")}: ${errorMessage}`,
    );
    return { success: false, error: errorMessage };
  }
};
