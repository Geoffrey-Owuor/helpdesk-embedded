import { IssueValueTypes } from "@/lib/assets";
import {
  indicatorChip,
  statusDotColors,
  unknownStatusDot,
} from "@/lib/indicatorStyles";

interface IssueStatusProps {
  status: IssueValueTypes;
}

const IssueStatusFormatter = ({ status }: IssueStatusProps) => (
  <div
    className={`inline-flex w-fit items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold ${indicatorChip}`}
  >
    <span
      className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDotColors[status] ?? unknownStatusDot}`}
    />
    <span className="truncate capitalize">{status}</span>
  </div>
);

export default IssueStatusFormatter;
