"use client";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/AxiosClient";
import { dateFormatter } from "@/public/assets";
import {
  ShieldCheck,
  Headset,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";
import Pagination from "../IssuesData/Pagination";
import { useState, useEffect, useMemo } from "react";
import SearchRefetch from "./SearchRefetch";
import SkeletonBox from "@/components/Skeletons/SkeletonBox";
import UserCards from "./UserCards";

// ── Types ────────────────────────────────────────────────────────────────────

interface UserRecord {
  user_id: string;
  username: string;
  email: string;
  department: string;
  role: "admin" | "user" | "agent";
  is_user_active: boolean;
  created_at: string;
}

// ── Role config ───────────────────────────────────────────────────────────────

const ROLES: Record<
  string,
  { icon: React.ReactNode; label: string; styles: string }
> = {
  admin: {
    icon: <ShieldCheck size={13} />,
    label: "Admin",
    styles:
      "bg-neutral-800 text-neutral-100 dark:bg-neutral-200 dark:text-neutral-900",
  },
  user: {
    icon: <UserRound size={13} />,
    label: "User",
    styles:
      "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200",
  },
  agent: {
    icon: <Headset size={13} />,
    label: "Agent",
    styles:
      "bg-neutral-300 text-neutral-800 dark:bg-neutral-600 dark:text-neutral-100",
  },
};

// ── Active badge config ────────────────────────────────────────────────────────

const ACTIVE_STATES: Record<
  string,
  { icon: React.ReactNode; label: string; styles: string }
> = {
  true: {
    icon: <CheckCircle2 size={13} />,
    label: "Active",
    styles:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  },
  false: {
    icon: <XCircle size={13} />,
    label: "Inactive",
    styles: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function Badge({
  icon,
  label,
  styles,
}: {
  icon: React.ReactNode;
  label: string;
  styles: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-medium tracking-wide ${styles}`}
    >
      {icon}
      {label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-neutral-100 dark:border-neutral-800">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <SkeletonBox className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={7} className="py-20 text-center">
        <div className="flex flex-col items-center gap-3 text-neutral-400 dark:text-neutral-500">
          <UsersRound size={36} strokeWidth={1.2} />
          <p className="text-sm font-medium">No users found</p>
        </div>
      </td>
    </tr>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const Users = () => {
  const {
    data: users = [],
    isPending: loading,
    refetch: refetchUsers,
  } = useQuery<UserRecord[]>({
    queryKey: ["UsersDataInfo"],
    queryFn: async () => {
      const response = await apiClient.get("/get-users");
      return response.data;
    },
  });

  //Search value
  const [searchValue, setSearchValue] = useState("");

  //  Memo hook for filtering data
  const filteredUsers = useMemo(() => {
    if (!searchValue) return users;

    const lowSearch = searchValue.toLowerCase();

    return users.filter((user) => {
      // Get all values in the user object

      return Object.values(user).some((value) =>
        String(value).toLocaleLowerCase().includes(lowSearch),
      );
    });
  }, [searchValue, users]);

  const perPageOptions = [6, 12, 24, 48, 96, 192];
  const [usersPerPage, setUsersPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(
    indexOfFirstUser,
    Math.min(indexOfLastUser, filteredUsers.length),
  );

  //useEffect to reset current page to one on data change or issuesPerPage change
  useEffect(() => {
    Promise.resolve().then(() => setCurrentPage(1));
  }, [filteredUsers, usersPerPage]);

  const handleEdit = (user: UserRecord) => {
    // TODO: implement edit functionality
    console.log("Edit user:", user);
  };

  const handleDelete = (user: UserRecord) => {
    // TODO: implement delete functionality
    console.log("Delete user:", user);
  };

  return (
    <div className="w-full space-y-4">
      {/* User Cards */}
      <UserCards />
      {/* Header */}
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            IssueDesk Users
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {loading
              ? "Loading..."
              : `Registered Account${users?.length !== 1 ? "s" : ""}: ${users?.length ?? 0}`}
          </p>
        </div>

        {/* Search and Refresh */}
        <SearchRefetch
          searchValue={searchValue}
          onSearch={(value) => setSearchValue(value)}
          refetch={() => refetchUsers()}
        />
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 text-sm">
            {/* Head */}
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/50">
                {[
                  "User",
                  "Email",
                  "Department",
                  "Role",
                  "Status",
                  "Joined",
                  "Actions",
                ].map((col) => (
                  <th
                    key={col}
                    className={`px-4 py-3 text-left text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400 ${
                      col === "Actions" ? "text-right" : ""
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))
              ) : !filteredUsers || filteredUsers.length === 0 ? (
                <EmptyState />
              ) : (
                currentUsers.map((user) => {
                  const role = ROLES[user.role] ?? ROLES.user;
                  const active =
                    ACTIVE_STATES[String(user.is_user_active)] ??
                    ACTIVE_STATES.false;

                  return (
                    <tr
                      key={user.user_id}
                      className="group hover:bg-neutral-100 dark:hover:bg-neutral-900/50"
                    >
                      {/* User */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* Avatar initials */}
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
                            {user.username.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-neutral-900 dark:text-neutral-100">
                            {user.username}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 text-neutral-600 dark:text-neutral-400">
                        {user.email}
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3.5 text-neutral-600 dark:text-neutral-400">
                        {user.department || (
                          <span className="text-neutral-400 dark:text-neutral-600">
                            —
                          </span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3.5">
                        <Badge
                          icon={role.icon}
                          label={role.label}
                          styles={role.styles}
                        />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <Badge
                          icon={active.icon}
                          label={active.label}
                          styles={active.styles}
                        />
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3.5 text-neutral-500 dark:text-neutral-400">
                        {dateFormatter(user.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(user)}
                            aria-label="Edit user"
                            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            aria-label="Delete user"
                            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredUsers && filteredUsers.length > 0 && (
          //   Pagination ui
          <div className="px-4">
            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              issuesPerPage={usersPerPage}
              setIssuesPerPage={setUsersPerPage}
              perPageOptions={perPageOptions}
              indexOfFirstIssue={indexOfFirstUser}
              indexOfLastIssue={indexOfLastUser}
              issuesLength={filteredUsers.length}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
