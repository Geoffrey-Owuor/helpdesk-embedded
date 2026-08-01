import { Building2 } from "lucide-react";
import BreakdownListCard from "./BreakdownListCard";
import { DepartmentBreakdownEntry } from "./types";

const DepartmentBreakdownCard = ({
  departmentBreakdown,
  isLoading,
}: {
  departmentBreakdown: DepartmentBreakdownEntry[];
  isLoading: boolean;
}) => (
  <BreakdownListCard
    title="Issues per Department"
    icon={Building2}
    iconColor="text-purple-600 dark:text-purple-400"
    iconBgColor="bg-purple-50 dark:bg-purple-900/20"
    entries={departmentBreakdown.map(({ department, count }) => ({
      label: department,
      count,
    }))}
    isLoading={isLoading}
    emptyMessage="No submitter departments match the current filters."
  />
);

export default DepartmentBreakdownCard;
