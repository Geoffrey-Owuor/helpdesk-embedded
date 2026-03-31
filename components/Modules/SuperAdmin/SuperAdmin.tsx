"use client";
import { useState } from "react";
import Users from "./Users";
import IssuesMapping from "./IssuesMapping/IssuesMapping";
import { useQueryClient } from "@tanstack/react-query";
import { RotateCw } from "lucide-react";

const SuperAdmin = () => {
  const querClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("users");
  const queryKey =
    activeTab === "users" ? ["UserCountsData"] : ["IssueCountsData"];

  const refetch = () => {
    querClient.invalidateQueries({ queryKey: queryKey });
  };
  return (
    <div className="py-6 md:py-3.5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex flex-col">
          <span className="text-xl font-semibold capitalize">
            {activeTab} Summary
          </span>
          <span className="text-sm text-neutral-800 capitalize dark:text-neutral-400">
            Summary of {activeTab}
          </span>
        </div>
        {/* Tabs */}
        <div className="inline-flex items-center gap-4">
          <button
            onClick={refetch}
            title="Refresh Cards"
            className="rounded-xl bg-neutral-100 p-2 transition-colors duration-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            <RotateCw className="h-5 w-5" />
          </button>
          <div className="inline-flex items-center gap-1 rounded-2xl bg-neutral-100 p-1 dark:bg-neutral-900">
            <button
              onClick={() => setActiveTab("users")}
              className={`rounded-xl px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                activeTab === "users"
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100"
                  : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab("issues")}
              className={`rounded-xl px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                activeTab === "issues"
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100"
                  : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`}
            >
              Issues Mapping
            </button>
          </div>
        </div>
      </div>

      {/* Tab content placeholder */}
      <div className="w-full">
        {activeTab === "users" && <Users />}
        {activeTab === "issues" && <IssuesMapping />}
      </div>
    </div>
  );
};

export default SuperAdmin;
