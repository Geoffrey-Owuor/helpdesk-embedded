"use client";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/AxiosClient";
import { dateFormatter } from "@/public/assets";
import {
  ShieldCheck,
  Headset,
  CheckCircle2,
  XCircle,
  Trash2,
  UserRoundPen,
  UserRoundCheck,
} from "lucide-react";
import Pagination from "../IssuesData/Pagination";
import { useState, useEffect, useMemo } from "react";
import SkeletonBox from "@/components/Skeletons/SkeletonBox";
import UserCards from "./UserCards";
import ExportData from "./ExportData";
import SearchInput from "./SearchInput";
import { useUser } from "@/contexts/UserContext";
import EditUserModal from "./EditModals/EditUserModal";

// ── Types ────────────────────────────────────────────────────────────────────

export interface UserRecord {
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
    icon: <UserRoundCheck size={13} />,
    label: "User",
    styles:
      "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
  },
  agent: {
    icon: <Headset size={13} />,
    label: "Agent",
    styles:
      "bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100",
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
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium tracking-wide ${styles}`}
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

  const { userId } = useUser();

  //Search value
  const [searchValue, setSearchValue] = useState("");

  const [activeEditId, setActiveEditId] = useState<string | null>(null);

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

  const handleDelete = (user: UserRecord) => {
    // TODO: implement delete functionality
    console.log("Delete user:", user);
  };

  return (
    <>
      {/* User Cards */}
      <UserCards />

      {/* Header */}
      <div className="mb-4 flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-10">
        <div className="inline-flex flex-col">
          <h2 className="text-xl font-semibold">Users Data</h2>
          <span className="text-sm text-neutral-800 dark:text-neutral-400">
            Users Detailed Information
          </span>
          <span className="text-xs text-neutral-500">
            {loading
              ? "Loading..."
              : `Registered Account${users?.length !== 1 ? "s" : ""}: ${users?.length ?? 0}`}
          </span>
        </div>

        {/* Search and Refresh */}
        <SearchInput
          searchValue={searchValue}
          onSearch={(value) => setSearchValue(value)}
        />

        {/* Export Button */}
        <ExportData type="users" refetch={() => refetchUsers()} />
      </div>

      {/* Table card */}
      <div className="layout-scrollbar w-full overflow-x-auto rounded-xl bg-gray-100/50 px-4 py-2 dark:bg-neutral-950">
        <table className="min-w-full border-separate border-spacing-y-3 text-left">
          {/* Head */}
          <thead>
            <tr>
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
                  className={`px-4 pb-2 text-xs font-semibold tracking-wider whitespace-nowrap text-gray-500 uppercase dark:text-gray-400 ${
                    col === "Actions" ? "text-right" : ""
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
            ) : !filteredUsers || filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-12 text-center text-neutral-500 shadow-sm dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-400"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              currentUsers.map((user) => {
                const role = ROLES[user.role] ?? ROLES.user;
                const active =
                  ACTIVE_STATES[String(user.is_user_active)] ??
                  ACTIVE_STATES.false;

                return (
                  <tr
                    key={user.user_id}
                    className="group cursor-default rounded-xl text-sm shadow-sm transition-transform duration-200"
                  >
                    {/* User */}
                    <td className="bg-white px-4 py-3.5 group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
                          {user.username.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {user.username}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="bg-white px-4 py-3.5 text-neutral-600 group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:text-neutral-400 dark:group-hover:bg-neutral-800/50">
                      {user.email}
                    </td>

                    {/* Department */}
                    <td className="bg-white px-4 py-3.5 text-neutral-600 group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:text-neutral-400 dark:group-hover:bg-neutral-800/50">
                      {user.department || (
                        <span className="text-neutral-400 dark:text-neutral-600">
                          —
                        </span>
                      )}
                    </td>

                    {/* Role */}
                    <td className="bg-white px-4 py-3.5 group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                      <Badge
                        icon={role.icon}
                        label={role.label}
                        styles={role.styles}
                      />
                    </td>

                    {/* Status */}
                    <td className="bg-white px-4 py-3.5 group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                      <Badge
                        icon={active.icon}
                        label={active.label}
                        styles={active.styles}
                      />
                    </td>

                    {/* Joined */}
                    <td className="bg-white px-4 py-3.5 text-neutral-500 group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:text-neutral-400 dark:group-hover:bg-neutral-800/50">
                      {dateFormatter(user.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="bg-white px-4 py-3.5 group-hover:bg-gray-50 first:rounded-l-xl last:rounded-r-xl dark:bg-neutral-900/50 dark:group-hover:bg-neutral-800/50">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setActiveEditId(user.user_id)}
                          disabled={userId === user.user_id}
                          className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-700 disabled:opacity-50 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                        >
                          <UserRoundPen size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={
                            userId === user.user_id || !user.is_user_active
                          }
                          className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-100 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                        >
                          <Trash2 size={15} />
                        </button>

                        {/* The edit modal */}
                        {activeEditId === user.user_id && (
                          <EditUserModal
                            isModalOpen={activeEditId === user.user_id}
                            hideModal={() => setActiveEditId(null)}
                            userInfo={{
                              name: user.username,
                              email: user.email,
                              department: user.department,
                              role: user.role,
                              status: String(user.is_user_active),
                            }}
                          />
                        )}
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
      )}
    </>
  );
};

export default Users;
