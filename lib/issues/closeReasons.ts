// Why an issue was closed without being resolved first (issues_table.issue_close_reason,
// migrations/009). Closing a resolved issue needs no reason; closing any other one
// does, and analytics leaves those out of resolution times and the resolution SLA.
// Keep the values in sync with the column's CHECK constraint.
export const CLOSE_REASONS = [
  { value: "duplicate", label: "Duplicate" },
  { value: "invalid", label: "Invalid / not an issue" },
  { value: "withdrawn", label: "Withdrawn by user" },
  { value: "other", label: "Other" },
] as const;

export type CloseReason = (typeof CLOSE_REASONS)[number]["value"];

export const isCloseReason = (value: unknown): value is CloseReason =>
  CLOSE_REASONS.some((reason) => reason.value === value);

export const closeReasonLabel = (value: string | null | undefined) =>
  CLOSE_REASONS.find((reason) => reason.value === value)?.label ?? null;
