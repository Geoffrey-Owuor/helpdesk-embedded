import { Building2 } from "lucide-react";
import TimingBreakdownCard from "./TimingBreakdownCard";
import { DepartmentBreakdownEntry } from "./types";

const DepartmentTimingCard = ({
  departmentBreakdown,
  isLoading,
}: {
  departmentBreakdown: DepartmentBreakdownEntry[];
  isLoading: boolean;
}) => (
  <TimingBreakdownCard
    title="Departments TAT"
    icon={Building2}
    entries={departmentBreakdown.map(
      ({ department, avgResolutionSeconds, avgStaleSeconds }) => ({
        label: department,
        avgResolutionSeconds,
        avgStaleSeconds,
      }),
    )}
    isLoading={isLoading}
    emptyMessage="No submitter departments match the current filters."
  />
);

export default DepartmentTimingCard;
