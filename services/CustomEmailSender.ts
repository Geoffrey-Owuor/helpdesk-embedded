import { ConfidentialClientApplication, Configuration } from "@azure/msal-node";

const msalConfig: Configuration = {
  auth: {
    clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
    authority: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}`,
    clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
  },
};

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

const cca = new ConfidentialClientApplication(msalConfig);

async function getAccessToken() {
  const result = await cca.acquireTokenByClientCredential({
    scopes: ["https://graph.microsoft.com/.default"],
  });
  return result?.accessToken;
}

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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("Failed to retrieve access token");

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

    let attempts = 0;
    const maxRetries = 3;

    while (attempts < maxRetries) {
      attempts++;

      const response = await fetch(
        `https://graph.microsoft.com/v1.0/users/${from}/sendMail`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailPayload),
        },
      );

      if (response.ok) return { success: true };

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const waitTime = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : 2000 * attempts;
        console.warn(
          `Graph API limit hit (429). Retrying in ${waitTime / 1000}s...`,
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ||
          `Failed to send email (Status: ${response.status})`,
      );
    }

    throw new Error("Max retries reached.");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Custom Graph Email failed:", errorMessage);
    return { success: false, error: errorMessage };
  }
};
