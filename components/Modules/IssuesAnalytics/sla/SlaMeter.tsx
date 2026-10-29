import { chartColors } from "../charts/chartTheme";
import { formatPercent, meetsTarget } from "./slaFormat";

// Compliance against its target: the fill carries the status colour, the
// tick marks the target. The numbers sit beside it in text, so the meter
// only ever repeats what's written.
const SlaMeter = ({
  value,
  target,
}: {
  value: number | null;
  target: number | null;
}) => (
  <div
    role="img"
    aria-label={`${formatPercent(value)} against a ${formatPercent(target)} target`}
    className="relative h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800"
  >
    {value !== null && (
      <div
        className="h-full rounded-full"
        style={{
          width: `${value}%`,
          backgroundColor: meetsTarget(value, target)
            ? chartColors.statusGood
            : chartColors.statusCritical,
        }}
      />
    )}
    {target !== null && (
      <div
        className="absolute -top-1 h-3.5 w-0.5 rounded-full"
        style={{
          left: `calc(${target}% - 1px)`,
          backgroundColor: chartColors.target,
        }}
      />
    )}
  </div>
);

export default SlaMeter;
