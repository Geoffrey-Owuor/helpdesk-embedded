"use client";

import { useState, useRef, useEffect } from "react";
import { Building2, ChevronDown, Loader2 } from "lucide-react";
import { baseDepartments, basePath } from "@/public/assets";
import { ApiHandler } from "@/utils/ApiHandler";
import AuthShell from "./AuthShell";

const SSOCompletionForm = ({
  name,
  email,
}: {
  name: string;
  email: string;
}) => {
  const [department, setDepartment] = useState("");
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const departmentRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        departmentRef.current &&
        !departmentRef.current.contains(event.target as Node)
      ) {
        setIsDepartmentOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!department) {
      setError("Please select a department.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await ApiHandler("/api/sso/complete", "POST", {
        name,
        email,
        department,
      });

      if (!response.ok) {
        throw new Error("Failed to complete sso setup");
      }

      // Success! Redirect to the dashboard
      window.location.href = `${basePath}/dashboard`;
    } catch (error) {
      console.error("Sso completion error:", error);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="w-full max-w-90 px-2">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-center text-3xl font-semibold text-neutral-900 dark:text-white">
            Almost There!
          </h1>
          <p className="text-center text-neutral-600 dark:text-neutral-400">
            We just need to know your department to <br />
            finish setting up your account.
          </p>
        </div>

        {/* Microsoft User Data Card */}
        <div className="mb-8 flex items-center gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/50">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm dark:bg-neutral-800">
            {/* Microsoft SVG Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path fill="#f35325" d="M1 1h10.5v10.5H1z" />
              <path fill="#81bc06" d="M12.5 1H23v10.5H12.5z" />
              <path fill="#05a6f0" d="M1 12.5h10.5V23H1z" />
              <path fill="#ffba08" d="M12.5 12.5H23V23H12.5z" />
            </svg>
          </div>
          <div className="overflow-hidden">
            <h3 className="truncate font-semibold text-neutral-900 dark:text-white">
              {name}
            </h3>
            <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
              {email}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 pb-25">
          {/* Department Dropdown */}
          <div>
            {error && <p className="mb-2 pl-4 text-sm text-red-500">{error}</p>}

            <label className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Department
            </label>
            <div ref={departmentRef} className="relative">
              <button
                type="button"
                onClick={() => setIsDepartmentOpen((prev) => !prev)}
                className={`flex w-full items-center rounded-full border border-neutral-400 bg-white py-3 pr-12 pl-14 focus:border-neutral-600 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500 ${
                  department === ""
                    ? "text-neutral-400"
                    : "text-neutral-900 dark:text-white"
                }`}
              >
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6">
                  <Building2 className="h-5 w-5 text-neutral-400" />
                </div>
                <span className="flex-1 text-left">
                  {department || "Select your department"}
                </span>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <ChevronDown
                    className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${
                      isDepartmentOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {isDepartmentOpen && (
                <ul className="default-scrollbar absolute z-10 mt-2 max-h-52 w-full overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                  {baseDepartments.map((dept) => (
                    <li
                      key={dept.value}
                      onClick={() => {
                        setDepartment(dept.value);
                        setIsDepartmentOpen(false);
                        setError("");
                      }}
                      className={`cursor-pointer rounded-xl px-5 py-2.5 text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                        department === dept.value
                          ? "font-semibold text-neutral-900 dark:text-white"
                          : "text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      {dept.option}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !department}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-4 py-3 font-semibold text-white transition-colors hover:bg-neutral-800 focus:ring-1 focus:ring-neutral-600 focus:outline-none disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 dark:focus:ring-neutral-300"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Completing Setup...
              </>
            ) : (
              "Complete Setup"
            )}
          </button>
        </form>
      </div>
    </AuthShell>
  );
};

export default SSOCompletionForm;
