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
    entries={departmentBreakdown.map(({ department, count }) => ({
      label: department,
      count,
    }))}
    isLoading={isLoading}
    emptyMessage="No submitter departments match the current filters."
  />
);

export default DepartmentBreakdownCard;
