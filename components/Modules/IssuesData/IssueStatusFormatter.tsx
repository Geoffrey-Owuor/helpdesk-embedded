import { ReactNode } from "react";
import { IssueValueTypes } from "@/lib/assets";
import {
  indicatorChip,
  indicatorChipPicker,
  statusDotColors,
  unknownStatusDot,
} from "@/lib/indicatorStyles";

interface IssueStatusProps {
  status: IssueValueTypes;
  // Shown inside the chip after the label - the chevron when it opens a picker
  trailing?: ReactNode;
}

const IssueStatusFormatter = ({ status, trailing }: IssueStatusProps) => (
  <div
    className={`inline-flex w-fit items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold ${indicatorChip} ${trailing ? indicatorChipPicker : ""}`}
  >
    <span
      className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDotColors[status] ?? unknownStatusDot}`}
    />
    <span className="truncate capitalize">{status}</span>
    {trailing}
  </div>
);

export default IssueStatusFormatter;
