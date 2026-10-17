// OLD NODEMAILER EMAIL IMPLEMENTATION USING LESS SECURE GOOGLE APP PASSWORD
// import nodemailer, { SendMailOptions } from "nodemailer";
// import { Attachment } from "nodemailer/lib/mailer";

// // 1. Define an interface for your function arguments
// interface EmailOptions {
//   to: string | string[];
//   cc?: string;
//   subject: string;
//   html: string;
//   attachments?: {
//     filename: string;
//     content: string | Buffer;
//   }[];
// }

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_APP_PASSWORD,
//   },
// });

// export async function sendEmail({
//   to,
//   cc,
//   subject,
//   html,
//   attachments,
// }: EmailOptions) {
//   try {
//     // 2. Use SendMailOptions for the config object
//     const mailOptions: SendMailOptions = {
//       from: `"HelpDesk" <${process.env.GMAIL_USER}>`,
//       to,
//       cc,
//       subject,
//       html,
//     };

//     if (attachments) {
//       mailOptions.attachments = attachments.map(
//         (attachment): Attachment => ({
//           filename: attachment.filename,
//           content: attachment.content,
//           contentType: "application/pdf",
//         }),
//       );
//     }

//     await transporter.sendMail(mailOptions);
//     return { success: true };
//   } catch (error) {
//     // 3. Handle 'error' as an Error object safely
//     const errorMessage =
//       error instanceof Error ? error.message : "Unknown error";
//     console.error("Email failed:", errorMessage);
//     return { success: false, error: errorMessage };
//   }
// }

// NEW EMAILING IMPLEMENTATION - USING THE MICROSOFT GRAPH API

import { sendGraphMail } from "./GraphMailClient";
import {
  logSkippedEmail,
  notificationEmailsEnabled,
} from "./NotificationEmailSwitch";

interface EmailOptions {
  to: string | string[];
  cc?: string | string[];
  subject: string;
  html: string;
  // Account and support emails (verification codes, password resets,
  // first-login links, bug reports) - sent even when notification emails are
  // switched off. Everything else is a notification.
  essential?: boolean;
  attachments?: {
    filename: string;
    content: string; //We'll already have converted the attachments to base64 string at this point
    contentType: string;
  }[];
}

export const sendEmail = async ({
  to,
  cc,
  subject,
  html,
  attachments,
  essential = false,
}: EmailOptions): Promise<{
  success: boolean;
  skipped?: boolean;
  error?: string;
}> => {
  // Notification emails can be switched off (e.g. in dev) - see
  // NotificationEmailSwitch.ts. Reported as success so callers carry on.
  if (!essential && !notificationEmailsEnabled()) {
    logSkippedEmail({ subject, to, cc });
    return { success: true, skipped: true };
  }

  try {
    // Format recipients for Graph API
    const toRecipients = (Array.isArray(to) ? to : [to]).map((email) => ({
      emailAddress: { address: email },
    }));

    const ccRecipients = cc
      ? (Array.isArray(cc) ? cc : [cc]).map((email) => ({
          emailAddress: { address: email },
        }))
      : [];

    // Format attachments for Graph API
    const formattedAttachments = attachments?.map((file) => ({
      "@odata.type": "#microsoft.graph.fileAttachment",
      name: file.filename,
      contentType: file.contentType,
      // Graph requires content to be a Base64 string
      contentBytes: file.content,
    }));

    // Construct the Graph Message object
    const emailPayload = {
      message: {
        subject: subject,
        body: {
          contentType: "HTML",
          content: html,
        },
        toRecipients: toRecipients,
        ccRecipients: ccRecipients,
        attachments: formattedAttachments || [],
      },
      saveToSentItems: "true",
    };

    // Retries throttling, network failures and 5xx - see GraphMailClient.ts
    await sendGraphMail(process.env.EMAIL_SENDER!, emailPayload, subject);
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    // Subject + recipients so a dropped email can be resent by hand.
    console.error(
      `Graph Email failed: "${subject}" to ${[to].flat().join(", ")}: ${errorMessage}`,
    );
    return { success: false, error: errorMessage };
  }
};
