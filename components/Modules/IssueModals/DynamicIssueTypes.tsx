"use client";
import { Asterisk } from "lucide-react";
import OptionsDropDown from "./OptionsDropDown";
import { fetchedIssueTypes } from "@/serverActions/GetIssueTypes";
import { useQuery } from "@tanstack/react-query";

type DynamicTypeProps = {
  value: string;
  onChange: (value: string) => void;
  department: string;
  error: boolean;
};

const DynamicIssueTypes = ({
  value,
  onChange,
  department,
  error,
}: DynamicTypeProps) => {
  const { data: options = [], isLoading: loading } = useQuery({
    queryKey: ["issueTypes", department],
    queryFn: () => fetchedIssueTypes(department),
    enabled: !!department,
  });

  // Disable dropdown if no department is selected
  const isDisabled = !department;

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor="issue_type"
        className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400"
      >
        Issue Type
        <Asterisk className="h-3 w-3 text-red-500" />
      </label>
      <OptionsDropDown
        value={value}
        onChange={onChange}
        dropDownType="Issue Types"
        options={options}
        error={error}
        loading={loading}
        disabled={isDisabled}
      />
    </div>
  );
};

export default DynamicIssueTypes;
