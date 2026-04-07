"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/AxiosClient";
import { Pencil, Trash2, ShieldCheck, Headset } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import SkeletonBox from "@/components/Skeletons/SkeletonBox";
import Pagination from "../../IssuesData/Pagination";
import SearchInput from "../SearchInput";
import ExportData from "../ExportData";
import IssuePriorityFormatter from "../../IssuesData/IssuePriorityFormatter";
import IssuesMappingCards from "./IssuesMappingCards";
import EditIssueTypeModal from "../EditModals/EditIssueTypeModal";

// ── Types ────────────────────────────────────────────────────────────────────

export interface IssueMappingRecord {
  issue_id: string;
  agent_name: string;
  agent_email: string;
  admin_name: string;
  admin_email: string;
  issue_type: string;
  issue_priority: string;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 5 }).map((_, i) => (
        <td
          key={i}
          className="bg-white/50 px-4 py-4 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/30"
        >
          <SkeletonBox className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

const UserCell = ({
  name,
  email,
  role,
}: {
  name: string;
  email: string;
  role: "agent" | "admin";
}) => (
  <div className="flex items-center gap-3">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-bold text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
      {name.slice(0, 2).toUpperCase()}
    </div>
    <div className="flex flex-col">
      <span className="flex items-center gap-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
        {name}
        {role === "admin" ? (
          <ShieldCheck size={12} className="text-purple-500" />
        ) : (
          <Headset size={12} className="text-blue-500" />
        )}
      </span>
      <span className="max-w-37.5 truncate text-[11px] text-neutral-500">
        {email}
      </span>
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const IssuesMapping = () => {
  const [searchValue, setSearchValue] = useState("");
  const [activeEditId, setActiveEditId] = useState<string | null>(null);

  const {
    data: issuesMapping = [],
    isPending: loading,
    refetch: refetchIssuesMapping,
  } = useQuery<IssueMappingRecord[]>({
    queryKey: ["issuesMappingDataInfo"],
    queryFn: async () => {
      const response = await apiClient.get("/get-issuesmapping");
      return response.data;
    },
  });

  // Filtered mapped data - admins
  const adminInformation = [
    ...new Map(
      issuesMapping.map((issue) => [
        issue.admin_email,
        { option: issue.admin_name, value: issue.admin_email },
      ]),
    ).values(),
  ];

  // Filtered mapped data - agents
  const agentsInformation = [
    ...new Map(
      issuesMapping.map((issue) => [
        issue.agent_email,
        { option: issue.agent_name, value: issue.agent_email },
      ]),
    ).values(),
  ];

  // 1. Search Logic
  const filteredMapping = useMemo(() => {
    if (!searchValue) return issuesMapping;
    const lowSearch = searchValue.toLowerCase();
    return issuesMapping.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(lowSearch),
      ),
    );
  }, [searchValue, issuesMapping]);

  // 2. Pagination State
  const perPageOptions = [6, 12, 24, 48, 96, 192];
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(filteredMapping.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMapping.slice(
    indexOfFirstItem,
    Math.min(indexOfLastItem, filteredMapping.length),
  );

  useEffect(() => {
    Promise.resolve().then(() => setCurrentPage(1));
  }, [filteredMapping, itemsPerPage]);

  const handleDelete = (id: string) => console.log("Delete Mapping ID:", id);

  return (
    <>
      <IssuesMappingCards />

      {/* Header Section */}
      <div className="mb-4 flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-10">
        <div className="inline-flex flex-col">
          <h2 className="text-xl font-semibold">Issues Mapping</h2>
          <span className="text-sm text-neutral-800 dark:text-neutral-400">
            Issues Mapping Configurations
          </span>
          <span className="text-xs text-neutral-500">
            {loading
              ? "Loading..."
              : `Active Mappings: ${issuesMapping.length}`}
          </span>
        </div>

        <SearchInput
          searchValue={searchValue}
          onSearch={(value) => setSearchValue(value)}
        />

        <ExportData
          agentsInfo={agentsInformation}
          adminsInfo={adminInformation}
          type="issues"
          refetch={() => refetchIssuesMapping()}
        />
      </div>

      {/* Table Section */}
      <div className="layout-scrollbar w-full overflow-x-auto rounded-xl bg-gray-100/50 px-4 py-2 dark:bg-neutral-950">
        <table className="min-w-full border-separate border-spacing-y-3 text-left">
          <thead>
            <tr>
              {[
                "Assigned Agent",
                "Supervising Admin",
                "Issue Type",
                "Default Priority",
                "Actions",
              ].map((col) => (
                <th
                  key={col}
                  className={`px-4 pb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400 ${col === "Actions" ? "text-right" : ""}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
            ) : filteredMapping.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-12 text-center text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950"
                >
                  No mappings found.
                </td>
              </tr>
            ) : (
              currentItems.map((item) => (
                <tr
                  key={item.issue_id}
                  className="group rounded-xl text-sm shadow-sm transition-transform duration-200"
                >
                  {/* Agent */}
                  <td className="bg-white px-4 py-3 group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                    <UserCell
                      name={item.agent_name}
                      email={item.agent_email}
                      role="agent"
                    />
                  </td>

                  {/* Admin */}
                  <td className="bg-white px-4 py-3 group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                    <UserCell
                      name={item.admin_name}
                      email={item.admin_email}
                      role="admin"
                    />
                  </td>

                  {/* Issue Type */}
                  <td className="bg-white px-4 py-3 group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                      {item.issue_type}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="bg-white px-4 py-3 group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                    <IssuePriorityFormatter priority={item.issue_priority} />
                  </td>

                  {/* Actions */}
                  <td className="bg-white px-4 py-3 group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setActiveEditId(item.issue_id)}
                        disabled={item.admin_email === "Unassigned"}
                        className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 disabled:opacity-50 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.issue_id)}
                        disabled={item.admin_email === "Unassigned"}
                        className="rounded-lg p-2 text-neutral-400 hover:bg-red-100 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                      >
                        <Trash2 size={15} />
                      </button>

                      {/* The edit modal */}
                      {activeEditId === item.issue_id && (
                        <EditIssueTypeModal
                          isModalOpen={activeEditId === item.issue_id}
                          hideModal={() => setActiveEditId(null)}
                          agentsInfo={agentsInformation}
                          adminsInfo={adminInformation}
                          issueInfo={{
                            issueType: item.issue_type,
                            issuePriority: item.issue_priority,
                            adminEmail: item.admin_email,
                            agentEmail: item.agent_email,
                          }}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && filteredMapping.length > 0 && (
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          issuesPerPage={itemsPerPage}
          setIssuesPerPage={setItemsPerPage}
          perPageOptions={perPageOptions}
          indexOfFirstIssue={indexOfFirstItem}
          indexOfLastIssue={Math.min(indexOfLastItem, filteredMapping.length)}
          issuesLength={filteredMapping.length}
        />
      )}
    </>
  );
};

export default IssuesMapping;
