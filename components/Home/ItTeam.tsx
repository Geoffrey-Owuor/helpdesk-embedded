"use client";

import { useQuery } from "@tanstack/react-query";
import HomeNavBar from "../Navigation/HomeNavBar";
import Footer from "./Footer";
import SkeletonBox from "../Skeletons/SkeletonBox";
import { Mail, Phone, Users } from "lucide-react";
import { GetItTeam, ItTeamMember } from "@/serverActions/GetItTeam";

// User Icon
const UserIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    className={className}
  >
    <path
      fill="currentColor"
      d="M12 2a5 5 0 1 0 0 10a5 5 0 1 0 0-10M4 22h16c.55 0 1-.45 1-1v-1c0-3.86-3.14-7-7-7h-4c-3.86 0-7 3.14-7 7v1c0 .55.45 1 1 1"
    ></path>
  </svg>
);

const ItTeam = () => {
  const {
    data: teamMembers = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["itTeamData"],
    queryFn: GetItTeam,
  });

  return (
    <main className="layout-scrollbar home-container flex h-screen flex-col overflow-y-auto bg-white dark:bg-neutral-950">
      <HomeNavBar />

      <div className="custom:px-8 mx-auto mt-8 mb-16 w-full max-w-6xl flex-1 px-4 2xl:max-w-7xl">
        {/* Header Section */}
        <div className="mb-12 text-center md:text-left">
          <h1 className="mb-4 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Meet the IT Team
          </h1>
          <p className="max-w-2xl text-base text-neutral-600 dark:text-neutral-400">
            Our dedicated technology professionals work behind the scenes to
            keep our infrastructure secure, our networks fast, and our employees
            productive.
          </p>
        </div>

        {/* Team Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBox key={index} className="h-64" />
            ))}
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-neutral-300 bg-neutral-50/50 py-20 text-center dark:border-neutral-800 dark:bg-neutral-900/20">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-200/50 text-neutral-400 dark:bg-neutral-800/50 dark:text-neutral-500">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              No team members found
            </h3>
            <p className="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
              It looks like the IT team directory is empty right now. Check
              back later.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 rounded-full bg-neutral-100 px-4 py-1.5 text-sm font-medium hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member: ItTeamMember) => (
              <div
                key={member.id}
                className="flex flex-col rounded-2xl border border-neutral-200 bg-neutral-50/50 p-6 shadow-xs transition-all hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900/30"
              >
                {/* Card Header: Avatar, Name, Title */}
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                      <UserIcon className="text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        {member.name}
                      </h3>
                      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                        {member.title_name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="mb-6 line-clamp-5 text-sm text-neutral-600 dark:text-neutral-400">
                  {member.title_description}
                </p>

                {/* Spacer to push contact info to the bottom if descriptions vary in length */}
                <div className="mt-auto flex flex-col gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                  {/* Email */}
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <Mail className="h-4 w-4 shrink-0 text-neutral-400" />
                    <span className="truncate">{member.email}</span>
                  </div>

                  {/* Phone Extension */}
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <Phone className="h-4 w-4 shrink-0 text-neutral-400" />
                    <span>Ext: {member.phone_extension}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
};

export default ItTeam;
