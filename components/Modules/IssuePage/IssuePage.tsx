"use client";

import { useIssuesData } from "@/contexts/IssuesDataContext";
import { useAutomationsData } from "@/contexts/AutomationsDataContext";
import { useSearchParams } from "next/navigation";
import IssueDetailsSkeleton from "@/components/Skeletons/IssueDetailsSkeleton";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Hash,
  Briefcase,
  Calendar,
  FileText,
  UserRound,
  PenLine,
  SquareCheckBig,
  UserRoundPen,
} from "lucide-react";
import IssueStatusFormatter from "../IssuesData/IssueStatusFormatter";
import { dateFormatter } from "@/public/assets";
import { titleHelper } from "@/public/assets";

export const IssuePage = ({ uuid }: { uuid: string }) => {
  // Get our data
  const { issuesData, loading } = useIssuesData();
  const { automationsData, loading: automationsLoading } = useAutomationsData();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const router = useRouter();

  let recordsData;
  let recordsLoading;

  switch (type) {
    case "automation":
      recordsData = automationsData;
      recordsLoading = automationsLoading;
      break;
    default:
      recordsData = issuesData;
      recordsLoading = loading;
      break;
  }

  // Defining a constant to hold our specific issue
  const issueData = recordsData.find((record) => record.issue_uuid === uuid);

  if (recordsLoading) return <IssueDetailsSkeleton />;

  // Handle case where ID is invalid or not found after loading
  if (!issueData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
        <p className="text-lg font-semibold">Record not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 flex items-center gap-2 text-blue-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="px-2 py-6">
      {/* --- HEADER SECTION --- */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-col gap-3">
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
            {issueData.issue_title}
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {issueData.issue_reference_id}
            </span>
            <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600"></span>
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
              <Calendar className="h-4 w-4" />
              {dateFormatter(issueData.issue_created_at)}
            </div>

            <IssueStatusFormatter status={issueData.issue_status} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-xl bg-black px-3 py-2 text-sm text-white transition-colors duration-200 hover:bg-neutral-900 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden md:flex">back</span>
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-blue-700 px-3 py-2 text-sm text-white transition-colors duration-200 hover:bg-blue-800">
            <UserRoundPen className="h-4 w-4" />
            <span className="hidden md:flex">reassign</span>
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-green-700 px-3 py-2 text-sm text-white transition-colors duration-200 hover:bg-green-800">
            <SquareCheckBig className="h-4 w-4" />
            <span className="hidden md:flex">update status</span>
          </button>
        </div>
      </div>

      {/* Details Grid - Top Section */}
      <div className="mb-6 grid grid-cols-1 gap-8 rounded-xl border border-dashed border-neutral-200 px-4 py-6 md:grid-cols-2 lg:grid-cols-3 dark:border-neutral-800">
        {/* Column 1: Submitter Info */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-1 font-semibold text-neutral-900 dark:text-white">
            <UserRound className="h-4 w-4 text-blue-500" /> Submitter Details
          </h3>
          <div className="space-y-3">
            <InfoBlock
              label="Submitted By"
              value={issueData.issue_submitter_name}
            />
            <InfoBlock
              label="Department"
              value={issueData.issue_submitter_department}
            />
          </div>
        </div>

        {/* Column 2: Handling Info */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-1 font-semibold text-neutral-900 dark:text-white">
            <Briefcase className="h-4 w-4 text-blue-500" /> Handling Details
          </h3>
          <div className="space-y-3">
            <InfoBlock
              label="Target Department"
              value={issueData.issue_target_department}
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                Assigned Agent
              </span>
              <span
                className={`mt-1 ${
                  issueData.issue_agent_name === "Not Assigned"
                    ? "text-amber-500"
                    : "text-green-600 dark:text-green-400"
                }`}
              >
                {issueData.issue_agent_name}
              </span>
            </div>
          </div>
        </div>

        {/* Column 3: System Info */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-1 font-semibold text-neutral-900 dark:text-white">
            <Hash className="h-4 w-4 text-blue-500" /> Issue Data
          </h3>
          <div className="space-y-3">
            <InfoBlock label="Record Type" value={issueData.issue_type} />
            <InfoBlock label="UUID" value={issueData.issue_uuid} truncate />
          </div>
        </div>
      </div>

      {/* Description Section - Bottom */}
      <div className="rounded-xl border border-dashed border-neutral-200 p-4 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <h2 className="mb-4 flex items-center gap-1 font-semibold text-neutral-900 dark:text-white">
            <FileText className="h-4 w-4 text-blue-500" /> Description
          </h2>
          <button className="cursor-pointer rounded-full bg-neutral-100 p-2 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700">
            <PenLine className="h-4 w-4" />
          </button>
        </div>
        <p className="leading-relaxed whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
          {issueData.issue_description}
        </p>
      </div>
    </div>
  );
};

// Helper component for cleaner grid layout
const InfoBlock = ({
  label,
  value,
  truncate = false,
}: {
  label: string;
  value: string | number;
  truncate?: boolean;
}) => (
  <div className="flex flex-col">
    <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
      {label}
    </span>
    <span
      className={`mt-1 font-semibold text-neutral-900 dark:text-neutral-100 ${
        truncate ? "max-w-37.5 truncate" : ""
      }`}
      title={titleHelper(value)}
    >
      {value}
    </span>
  </div>
);

export default IssuePage;
