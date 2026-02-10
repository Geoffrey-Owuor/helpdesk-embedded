"use client";

import { titleHelper, dateFormatter } from "@/public/assets";
import Link from "next/link";
import IssueStatusFormatter from "./IssueStatusFormatter";
import { AssignedAgentFormatter } from "./AssignedAgentFormatter";
import { useRouter } from "next/navigation";
import { useLoadingLine } from "@/contexts/LoadingLineContext";
import { Calendar, User, Tag, AlignLeft, ArrowRight } from "lucide-react";

type CardViewDataProps = {
  currentIssues: Record<string, string | number>[];
  dynamicUrlParam: string;
};

const CardViewData = ({
  currentIssues,
  dynamicUrlParam,
}: CardViewDataProps) => {
  const router = useRouter();
  const { setLoadingLine } = useLoadingLine();

  if (currentIssues.length === 0) {
    return (
      <div className="w-full rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-12 text-center text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-400">
        No issues found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {currentIssues.map((issueData) => (
        <div
          key={issueData.issue_uuid}
          onClick={() => {
            setLoadingLine(true);
            router.push(
              `/dashboard/${issueData.issue_uuid}?type=${dynamicUrlParam}&title=${encodeURIComponent(issueData.issue_title)}&description=${encodeURIComponent(issueData.issue_description)}`,
            );
          }}
          className="group flex cursor-pointer flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-700"
        >
          {/* Header: Ref ID & Status */}
          <div className="mb-4 flex items-start justify-between gap-2">
            <Link
              onClick={(e) => {
                e.stopPropagation();
                setLoadingLine(true);
              }}
              href={`/dashboard/${issueData.issue_uuid}?type=${dynamicUrlParam}&title=${encodeURIComponent(issueData.issue_title)}&description=${encodeURIComponent(issueData.issue_description)}`}
              className="flex items-center gap-1.5 font-semibold text-neutral-500 transition-colors hover:text-blue-500 hover:underline dark:text-neutral-400"
            >
              {issueData.issue_reference_id}
            </Link>
            <IssueStatusFormatter status={issueData.issue_status} />
          </div>

          {/* Body: Title & Description */}
          <div className="mb-6 space-y-2">
            <h3
              className="line-clamp-1 text-sm font-bold text-neutral-900 dark:text-neutral-100"
              title={titleHelper(issueData.issue_title)}
            >
              {issueData.issue_title}
            </h3>

            <div className="flex items-start gap-2 text-neutral-600 dark:text-neutral-400">
              <AlignLeft size={16} className="mt-0.5 shrink-0 opacity-60" />
              <p
                className="line-clamp-2 text-xs leading-relaxed"
                title={titleHelper(issueData.issue_description)}
              >
                {issueData.issue_description}
              </p>
            </div>
          </div>

          {/* Footer: Metadata & Agent */}
          <div className="space-y-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
            {/* Dept/Type Row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-500">
                <Tag size={12} className="opacity-70" />
                <span className="truncate">{issueData.issue_type}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-500">
                <Calendar size={12} className="opacity-70" />
                <span>{dateFormatter(issueData.issue_created_at)}</span>
              </div>
            </div>

            {/* Submitter & Agent Row */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[11px] text-neutral-600 dark:text-neutral-400">
                <User size={13} className="opacity-70" />
                <div className="truncate">
                  <span className="font-semibold">
                    {issueData.issue_submitter_name}
                  </span>
                  <span className="mx-1 opacity-40">•</span>
                  <span className="opacity-70">
                    {issueData.issue_submitter_department}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-lg border border-neutral-100 bg-neutral-50 p-2 dark:border-neutral-800/50 dark:bg-neutral-800/40">
                <AssignedAgentFormatter
                  agentName={issueData.issue_agent_name}
                />
                <ArrowRight
                  size={14}
                  className="text-neutral-300 transition-colors group-hover:text-neutral-500"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardViewData;
