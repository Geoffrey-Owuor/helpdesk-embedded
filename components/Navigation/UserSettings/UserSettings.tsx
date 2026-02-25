"use client";

import { useUser } from "@/contexts/UserContext";
import ClientPortal from "@/components/Modules/ClientPortal";
import { Dispatch, SetStateAction } from "react";
import {
  X,
  Mail,
  Briefcase,
  Shield,
  KeyRound,
  LucideIcon,
  UserRound,
  CircleUserRound,
  UserRoundPen,
} from "lucide-react";

type UserSettingsProps = {
  isUserSettingsOpen: boolean;
  setIsUserSettingsOpen: Dispatch<SetStateAction<boolean>>;
};

const UserSettings = ({
  isUserSettingsOpen,
  setIsUserSettingsOpen,
}: UserSettingsProps) => {
  const { username, email, department, role } = useUser();

  if (!isUserSettingsOpen) return null;

  return (
    <ClientPortal>
      <div className="custom-blur fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm transition-all dark:bg-black/70">
        <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900/50">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Account Management
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Managing your profile and preferences.
              </p>
            </div>
            <button
              onClick={() => setIsUserSettingsOpen(false)}
              className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 space-y-8 overflow-y-auto p-6">
            {/* User Profile Section */}
            <section>
              <div className="mb-4 flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                <CircleUserRound className="h-5 w-5 text-blue-500" />
                <h3 className="text-sm font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                  Profile Information
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <InfoCard Icon={UserRound} label="Username" value={username} />
                <InfoCard Icon={Mail} label="Email Address" value={email} />
                <InfoCard
                  Icon={Briefcase}
                  label="Department"
                  value={department}
                />
                <InfoCard Icon={Shield} label="Role" value={role} />
              </div>
            </section>

            <div className="h-px w-full bg-neutral-200 dark:bg-neutral-800" />

            {/* Security Section (Password Reset) */}
            <section>
              <div className="mb-4 flex items-center gap-2 text-neutral-900 dark:text-neutral-100">
                <KeyRound className="h-5 w-5 text-blue-500" />
                <h3 className="text-sm font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                  CHANGE PASSWORD
                </h3>
              </div>

              <form className="max-w-md space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Current password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    className="w-full rounded-lg border border-neutral-300 bg-neutral-50/50 px-3 py-2.5 text-sm text-neutral-900 transition-all placeholder:text-neutral-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    New password
                  </label>
                  <input
                    type="password"
                    placeholder="Create a new password"
                    className="w-full rounded-lg border border-neutral-300 bg-neutral-50/50 px-3 py-2.5 text-sm text-neutral-900 transition-all placeholder:text-neutral-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm your new password"
                    className="w-full rounded-lg border border-neutral-300 bg-neutral-50/50 px-3 py-2.5 text-sm text-neutral-900 transition-all placeholder:text-neutral-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-100 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-sm text-white transition-all duration-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <UserRoundPen className="h-4 w-4" />
                  Update
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </ClientPortal>
  );
};

// Reusable micro-component for the profile info grid
const InfoCard = ({
  Icon,
  label,
  value,
}: {
  Icon: LucideIcon;
  label: string;
  value: string | undefined;
}) => (
  <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800/60 dark:bg-neutral-900/40">
    <div className="mt-0.5 text-neutral-400 dark:text-neutral-500">
      <Icon />
    </div>
    <div className="flex flex-col">
      <span className="text-xs text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      <span className="max-w-40 truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        {(label === "Role"
          ? `${value?.charAt(0).toUpperCase()}${value?.slice(1)}`
          : value) || "Not specified"}
      </span>
    </div>
  </div>
);

export default UserSettings;
