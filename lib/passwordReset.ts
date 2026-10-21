// Issues a password reset link (users.reset_token, valid 10 minutes) and
// emails it - used by the forgot-password form and the super admin "Send
// reset link" action. A successful reset also unlocks the account
// (app/api/reset-password). Server side only.
import crypto from "crypto";
import { query } from "@/lib/Db";
import { sendEmail } from "@/services/EmailService";
import ResetLinkTemplate from "@/templates/ResetLinkTemplate";
import { appUrl } from "@/lib/basePath";

export async function sendPasswordResetLink(
  userId: string,
  email: string,
): Promise<{ success: boolean; error?: string }> {
  const token = crypto.randomUUID();

  await query(
    `UPDATE users
     SET reset_token = $1,
     reset_token_expiry = NOW() + INTERVAL '10 minutes'
     WHERE user_id = $2`,
    [token, userId],
  );

  const resetLink = appUrl(`/reset-password?token=${token}`);

  return sendEmail({
    to: email,
    subject: "Password Reset Request",
    essential: true,
    html: ResetLinkTemplate(resetLink),
  });
}
