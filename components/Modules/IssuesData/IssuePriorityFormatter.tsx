import { ReactNode } from "react";
import { IssueValueTypes } from "@/lib/assets";
import {
  indicatorChip,
  indicatorChipPicker,
  priorityIndicators,
  unknownPriorityIndicator,
} from "@/lib/indicatorStyles";

interface IssuePriorityProps {
  priority: IssueValueTypes;
  showText?: boolean;
  // Shown inside the chip after the label - the chevron when it opens a picker
  trailing?: ReactNode;
}

const IssuePriorityFormatter = ({
  priority,
  showText = true,
  trailing,
}: IssuePriorityProps) => {
  const { icon: Icon, color } =
    priorityIndicators[priority] ?? unknownPriorityIndicator;

  // Without its label the badge names itself, for screen readers and on hover
  if (!showText) {
    return (
      <div
        role="img"
        aria-label={`${priority} priority`}
        title={`${priority} priority`}
        className={`inline-flex items-center justify-center rounded-lg p-1.5 ${indicatorChip}`}
      >
        <Icon size={12} className={`shrink-0 ${color}`} />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex w-fit items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold ${indicatorChip} ${trailing ? indicatorChipPicker : ""}`}
    >
      <Icon size={12} className={`shrink-0 ${color}`} />
      <span className="truncate">{priority}</span>
      {trailing}
    </div>
  );
};

export default IssuePriorityFormatter;
