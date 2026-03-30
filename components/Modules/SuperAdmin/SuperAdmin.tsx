"use client";
import { useState } from "react";
import Users from "./Users";
import IssuesMapping from "./IssuesMapping";

const SuperAdmin = () => {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="py-6 md:py-3.5">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex flex-col">
          <span className="text-xl font-semibold">Super Admin</span>
          <span className="text-sm text-neutral-800 dark:text-neutral-400">
            The Super Admin Page
          </span>
        </div>
        {/* Tabs */}
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
            onClick={() => setActiveTab("issues-mapping")}
            className={`rounded-xl px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              activeTab === "issues-mapping"
                ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100"
                : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            }`}
          >
            Issues Mapping
          </button>
        </div>
      </div>

      {/* Tab content placeholder */}
      <div className="w-full">
        {activeTab === "users" && <Users />}
        {activeTab === "issues-mapping" && <IssuesMapping />}
      </div>
    </div>
  );
};

export default SuperAdmin;
