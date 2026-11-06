// The statuses an issue can be moved to from its current one. A resolved issue
// can only be closed - sending it back to work goes through Reopen, which asks
// for a reason and records the reopening. A closed issue can't change at all.
const nextStatuses: Record<string, readonly string[]> = {
  open: ["in progress", "resolved", "closed"],
  "in progress": ["resolved", "closed"],
  resolved: ["closed"],
  closed: [],
};

export const canMoveToStatus = (from: string, to: string) =>
  nextStatuses[from]?.includes(to) ?? false;
