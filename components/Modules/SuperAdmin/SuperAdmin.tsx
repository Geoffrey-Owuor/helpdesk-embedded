"use client";
import { useState } from "react";

const SuperAdmin = () => {
  const [active, setActiveTab] = useState("");
  return (
    <div className="py-6 md:py-3.5">
      <div className="flex flex-col items-start gap-4 md:gap-6">
        <div className="inline-flex flex-col">
          <span className="text-xl font-semibold">Super Admin</span>
          <span className="text-sm text-neutral-800 dark:text-neutral-400">
            The Super Admin Page
          </span>
        </div>

        {/* The tabs for users and issues mapping */}
      </div>
    </div>
  );
};

export default SuperAdmin;
