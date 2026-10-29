import { CircleCheck, CircleX, CircleDashed } from "lucide-react";
import { chartColors } from "../charts/chartTheme";
import { meetsTarget } from "./slaFormat";

// Whether a compliance % meets its target - icon and label together, so the
// status never rests on colour alone. The text stays in ink colours.
const SlaStatus = ({
  value,
  target,
  compact = false,
}: {
  value: number | null;
  target: number | null;
  // Icon only, with the label kept for screen readers and as a tooltip
  compact?: boolean;
}) => {
  const status =
    value === null || target === null
      ? {
          label: "No data yet",
          Icon: CircleDashed,
          color: chartColors.inkMuted,
        }
      : meetsTarget(value, target)
        ? {
            label: "On target",
            Icon: CircleCheck,
            color: chartColors.statusGood,
          }
        : {
            label: "Below target",
            Icon: CircleX,
            color: chartColors.statusCritical,
          };

  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 dark:text-neutral-300"
      title={compact ? status.label : undefined}
    >
      <status.Icon
        className="h-3.5 w-3.5 shrink-0"
        style={{ color: status.color }}
        aria-hidden="true"
      />
      <span className={compact ? "sr-only" : ""}>{status.label}</span>
    </span>
  );
};

export default SlaStatus;
