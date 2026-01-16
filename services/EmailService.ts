import nodemailer, { SendMailOptions } from "nodemailer";
import { Attachment } from "nodemailer/lib/mailer";

// 1. Define an interface for your function arguments
interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    content: string | Buffer;
  }[];
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: EmailOptions) {
  try {
    // 2. Use SendMailOptions for the config object
    const mailOptions: SendMailOptions = {
      from: `"Issue Desk" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    };

    if (attachments) {
      mailOptions.attachments = attachments.map(
        (attachment): Attachment => ({
          filename: attachment.filename,
          content: attachment.content,
          contentType: "application/pdf",
        }),
      );
    }

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    // 3. Handle 'error' as an Error object safely
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Email failed:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
