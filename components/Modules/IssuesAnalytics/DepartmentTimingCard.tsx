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
    iconColor="text-purple-600 dark:text-purple-400"
    iconBgColor="bg-purple-50 dark:bg-purple-900/20"
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
