"use client";
import { Asterisk } from "lucide-react";
import OptionsDropDown from "./OptionsDropDown";
import { IssueOption } from "@/serverActions/GetIssueTypes";
import { fetchedIssueTypes } from "@/serverActions/GetIssueTypes";
import { useState, useEffect } from "react";

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
  const [options, setOptions] = useState<IssueOption[]>([]);
  const [loading, setLoading] = useState(false);

  // UseEffect for fetching issue types
  useEffect(() => {
    const fetchOptions = async () => {
      // Don't fetch if no department selected
      if (!department) {
        setOptions([]);
        return;
      }
      try {
        setLoading(true);
        const result = await fetchedIssueTypes(department);
        setOptions(result);
      } catch (error) {
        console.error("Failed to fetch issue types", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, [department]);

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
