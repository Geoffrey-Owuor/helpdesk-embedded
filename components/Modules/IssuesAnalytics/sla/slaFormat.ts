import { SlaStateCounts } from "../types";

// Share of the judged issues (met + breached) that met the target, 0-100.
// null when nothing has been judged yet - shown as "N/A", never as 0%.
export const compliancePercent = ({ met, breached }: SlaStateCounts) =>
  met + breached === 0 ? null : (met / (met + breached)) * 100;

// One decimal, so 94.6% next to a 95% target doesn't round up to look like
// it made it ("94.6%", but "95%" rather than "95.0%")
export const formatPercent = (value: number | null) =>
  value === null ? "N/A" : `${Math.round(value * 10) / 10}%`;

export const meetsTarget = (value: number | null, target: number | null) =>
  value !== null && target !== null && value >= target;

// Policy times: 15 -> "15 min", 60 -> "1 hr", 1440 -> "1 day"
export const formatSlaMinutes = (minutes: number) => {
  if (minutes % 1440 === 0) {
    const days = minutes / 1440;
    return `${days} ${days === 1 ? "day" : "days"}`;
  }
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} ${hours === 1 ? "hr" : "hrs"}`;
  }
  return `${minutes} min`;
};
