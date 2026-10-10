// NOTIFICATION_EMAILS_ENABLED=false turns off notification emails (issue
// events and reminders) - handy in dev for exercising flows without mailing
// anyone. Unset or "true" sends as normal. Essential emails (verification
// codes, password resets, first-login links, bug reports) and PostMail always
// send. Read on every call so it never needs a rebuild, only a restart.

const FLAG = "NOTIFICATION_EMAILS_ENABLED";

// Warn about an unrecognised value once per server process, not per email
let warnedAboutValue = false;

export const notificationEmailsEnabled = (): boolean => {
  const value = process.env[FLAG]?.trim().toLowerCase();

  if (!value || value === "true") return true;
  if (value === "false") return false;

  if (!warnedAboutValue) {
    warnedAboutValue = true;
    console.warn(
      `[email] ${FLAG}="${process.env[FLAG]}" is not "true" or "false" - notification emails will be sent.`,
    );
  }
  return true;
};

const listRecipients = (recipients?: string | string[]) =>
  (Array.isArray(recipients) ? recipients : recipients ? [recipients] : [])
    .filter(Boolean)
    .join(", ");

// Logs what would have been sent, for checking recipients while testing
export const logSkippedEmail = ({
  subject,
  to,
  cc,
}: {
  subject: string;
  to: string | string[];
  cc?: string | string[];
}) => {
  const ccList = listRecipients(cc);
  console.info(
    `[email] Skipped (${FLAG}=false): "${subject}" to ${listRecipients(to) || "(no recipients)"}${ccList ? ` cc ${ccList}` : ""}`,
  );
};
