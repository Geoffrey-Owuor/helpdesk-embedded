"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { fetchUserRecords, UserRecord } from "@/serverActions/FetchUserRecords";
import { Mail, UserRound } from "lucide-react";

type UserEmailAutocompleteProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: ChangeEvent<HTMLInputElement>) => void;
  onSelectUser: (user: UserRecord) => void;
  placeholder?: string;
  id?: string;
  name?: string;
};

export default function UserEmailAutocomplete({
  value,
  onChange,
  onBlur,
  onSelectUser,
  placeholder = "Search by email...",
  id = "user_email",
  name = "user_email",
}: UserEmailAutocompleteProps) {
  const [results, setResults] = useState<UserRecord[] | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(value);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // A ref to track if the current value change came from a selection click
  const skipSearchRef = useRef(false);

  // Handle clicking outside of the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce logic (waits 500ms after user stops typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  // Fetch results when debounced search changes
  useEffect(() => {
    async function getResults() {
      // If the value change was from a selection, reset the flag and abort the search
      if (skipSearchRef.current) {
        skipSearchRef.current = false;
        return;
      }

      // Only search if the user has typed at least 3 characters
      if (debouncedSearch.length < 3) {
        return;
      }

      const data = await fetchUserRecords(debouncedSearch);
      setResults(data);

      setShowDropdown(true);
    }

    getResults();
  }, [debouncedSearch]);

  const handleSelection = (user: UserRecord) => {
    // Set the flag to true right before we pass the new value up to the parent
    skipSearchRef.current = true;

    onSelectUser(user);
    setShowDropdown(false);
    setResults(null); // Clear results after selection
  };

  return (
    <div className="relative flex w-full flex-col" ref={wrapperRef}>
      <div className="relative">
        <input
          type="email"
          id={id}
          name={name}
          value={value}
          onChange={(e) => {
            // If they start typing manually again, ensure we don't skip the search
            skipSearchRef.current = false;
            onChange(e);
            setShowDropdown(true); // Re-open dropdown when typing
          }}
          onBlur={onBlur}
          required
          placeholder={placeholder}
          className="peer w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          autoComplete="off"
        />
      </div>

      {/* Dropdown Results */}
      {showDropdown && value.length >= 3 && (
        <div className="default-scrollbar custom-blur absolute top-[calc(100%+8px)] z-50 max-h-64 w-full overflow-y-auto rounded-xl border border-neutral-200 bg-white/95 p-1 shadow-xl dark:border-neutral-800 dark:bg-neutral-950/95">
          {results && results.length === 0 && (
            <div className="px-4 py-3 text-center text-xs text-neutral-500 dark:text-neutral-400">
              No matching users found.
            </div>
          )}
          {results && results.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="px-2 py-1 text-[10px] font-bold tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
                Suggested Users
              </span>
              {results.map((user, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelection(user)}
                  className="group flex flex-col items-start gap-1 rounded-lg px-3 py-2 text-left transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-900 group-hover:text-blue-600 dark:text-neutral-100 dark:group-hover:text-blue-400">
                    <UserRound className="h-3.5 w-3.5 text-neutral-400 group-hover:text-blue-500" />
                    <span className="max-w-50 truncate">{user.name}</span>
                  </span>

                  <span className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <Mail className="h-3 w-3" />
                    <span className="max-w-50 truncate">{user.email}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
