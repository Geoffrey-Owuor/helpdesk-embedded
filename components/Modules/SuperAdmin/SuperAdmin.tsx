"use client";
import { useState } from "react";
import Users from "./Users";
import IssuesMapping from "./IssuesMapping/IssuesMapping";
import { useQueryClient } from "@tanstack/react-query";
import { Bug, Building2, KeyRound, RotateCw, UsersRound } from "lucide-react";
import GroupEmailsModal from "./GroupEmails/GroupEmailsModal";
import SpecialAccessModal from "./SpecialAccess/SpecialAccessModal";

const SuperAdmin = () => {
  const querClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("users");
  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [showSpecialAccessModal, setShowSpecialAccessModal] = useState(false);

  const queryKey =
    activeTab === "users" ? ["UserCountsData"] : ["IssueCountsData"];

  const refetch = () => {
    querClient.invalidateQueries({ queryKey: queryKey });
  };
  return (
    <>
      {/* Group Emails Modal */}
      {showGroupsModal && (
        <GroupEmailsModal
          isModalOpen={showGroupsModal}
          closeModal={() => setShowGroupsModal(false)}
        />
      )}
      {/* Special Access Modal */}
      {showSpecialAccessModal && (
        <SpecialAccessModal
          isModalOpen={showSpecialAccessModal}
          closeModal={() => setShowSpecialAccessModal(false)}
        />
      )}
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
          <div className="inline-flex flex-wrap items-center gap-4">
            <button
              onClick={refetch}
              title="Refresh Cards"
              className="rounded-xl bg-neutral-100 p-2 transition-colors duration-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            >
              <RotateCw className="h-5 w-5" />
            </button>

            {/* Group Emails Button */}
            <button
              onClick={() => setShowGroupsModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-100 px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-200/60 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:bg-neutral-800/80"
            >
              <Building2 strokeWidth={1.5} className="h-4 w-4" />
              <span>Departments</span>
            </button>

            {/* Special Access Button */}
            <button
              onClick={() => setShowSpecialAccessModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-neutral-100 px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-200/60 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:bg-neutral-800/80"
            >
              <KeyRound strokeWidth={1.5} className="h-4 w-4" />
              <span>Special Access</span>
            </button>
            <div className="inline-flex items-center gap-1 rounded-2xl border border-neutral-200 bg-neutral-50 p-1 shadow-inner dark:border-neutral-800 dark:bg-neutral-950">
              <button
                onClick={() => setActiveTab("users")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                  activeTab === "users"
                    ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-neutral-100"
                    : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                }`}
              >
                <UsersRound className="h-4 w-4" />
                Users
              </button>
              <button
                onClick={() => setActiveTab("issues")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                  activeTab === "issues"
                    ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-neutral-100"
                    : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                }`}
              >
                <Bug className="h-4 w-4" />
                Issues
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
    </>
  );
};

export default SuperAdmin;
