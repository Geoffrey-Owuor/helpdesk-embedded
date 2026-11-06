"use client";

import {
  Palette,
  Activity,
  Flag,
  Lightbulb,
  Clock,
  CircleHelp,
  CircleGauge,
} from "lucide-react";
import IssueStatusFormatter from "../Modules/IssuesData/IssueStatusFormatter";
import IssuePriorityFormatter from "../Modules/IssuesData/IssuePriorityFormatter";
import RelativeTimeBadge from "../Modules/IssuesData/RelativeTimeBadge";
import { useEffect, useState } from "react";
import {
  priorityIndicators,
  unknownPriorityIndicator,
} from "@/lib/indicatorStyles";

// Constants for mapping over our legend data

const DEFAULT_TIME_NUMBERS = {
  recent1: 1749139205123,
  recent2: 1749139205123,
  aging1: 1749139205123,
  aging2: 1749139205123,
};

const ISSUE_STATUSES = [
  {
    status: "open",
    title: "Open",
    description:
      "The issue has been logged but has not yet been addressed or assigned to an agent.",
  },
  {
    status: "in progress",
    title: "In Progress",
    description: "An agent is actively working to resolve this issue.",
  },
  {
    status: "resolved",
    title: "Resolved",
    description:
      "The issue has been fixed or addressed, but is pending final confirmation before closing.",
  },
  {
    status: "closed",
    title: "Closed",
    description:
      "The issue is completely finished, confirmed, and no further action is required.",
  },
  {
    status: "unknown",
    title: "Unknown (Fallback)",
    description:
      "The fallback, a hollow dot, used when an unrecognized status text is provided.",
  },
];

const ISSUE_PRIORITIES = [
  {
    priority: "Critical",
    description:
      "System down or severe business disruption. Requires immediate, drop-everything attention.",
  },
  {
    priority: "High",
    description:
      "Major functionality is impacted but a workaround might exist. Should be addressed promptly.",
  },
  {
    priority: "Medium",
    description:
      "Standard priority. Moderate impact on operations. Handled in the normal queue.",
  },
  {
    priority: "Low",
    description:
      "Minor issue, cosmetic bug, or feature request. Addressed when time permits.",
  },
  {
    priority: "unassigned",
    description:
      "The fallback icon used when an unrecognized priority text is provided.",
  },
];

const DASHBOARD_CARD_ICONS = [
  { priority: "Critical", ...priorityIndicators.Critical },
  { priority: "High", ...priorityIndicators.High },
  { priority: "Medium", ...priorityIndicators.Medium },
  { priority: "Low", ...priorityIndicators.Low },
  { priority: "Unknown", ...unknownPriorityIndicator, icon: CircleHelp },
];

const ColorCodes = () => {
  // 1. Create a state to hold our mock timestamps safely
  const [mockTimes, setMockTimes] = useState<{
    recent1: number;
    recent2: number;
    aging1: number;
    aging2: number;
  }>(DEFAULT_TIME_NUMBERS);

  // 2. Calculate the times inside useEffect (pure, post-render execution)
  useEffect(() => {
    const now = Date.now();
    Promise.resolve().then(() =>
      setMockTimes({
        recent1: now - 1000 * 60 * 60 * 2, // 2 hours ago
        recent2: now - 1000 * 60 * 60 * 24 * 3, // 3 days ago
        aging1: now - 1000 * 60 * 60 * 24 * 8, // 8 days ago
        aging2: now - 1000 * 60 * 60 * 24 * 60, // 60 days ago
      }),
    );
  }, []);

  return (
    <div id="color-codes" className="scroll-mt-24">
      {/* Global Section Header */}
      <div className="mb-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
          <Palette className="h-3.5 w-3.5" />
          Color Legend
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl dark:text-white">
          Color Codes & Visuals
        </h2>
        <p className="mt-3 max-w-xl text-base text-neutral-500 dark:text-neutral-400">
          Understand the visual indicators used across HelpDesk. Colour is
          reserved for what needs attention, so anything that stands out is
          worth a look.
        </p>
      </div>

      <div className="space-y-16">
        {/* 1. Issue Statuses Section */}
        <section>
          <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold text-neutral-900 dark:text-white">
            <Activity className="h-5 w-5 text-neutral-500" />
            Issue Statuses
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {ISSUE_STATUSES.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
              >
                <div className="mb-4">
                  {/* Assuming your formatter takes a 'status' string prop */}
                  <IssueStatusFormatter status={item.status} />
                </div>
                <h4 className="mb-1 text-sm font-semibold text-neutral-900 dark:text-white">
                  {item.title}
                </h4>
                <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Issue Priorities Section */}
        <section>
          <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold text-neutral-900 dark:text-white">
            <Flag className="h-5 w-5 text-neutral-500" />
            Issue Priorities
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {ISSUE_PRIORITIES.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
              >
                <div className="mb-4 flex flex-wrap items-center gap-4">
                  {/* Standard text version */}
                  <div className="flex flex-col items-start gap-1.5">
                    <span className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                      Standard
                    </span>
                    <IssuePriorityFormatter priority={item.priority} />
                  </div>

                  {/* Divider */}
                  <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-800" />

                  {/* Icon only version */}
                  <div className="flex flex-col items-start gap-1.5">
                    <span className="text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                      Icon Only
                    </span>
                    <IssuePriorityFormatter
                      priority={item.priority}
                      showText={false}
                    />
                  </div>
                </div>

                <h4 className="mb-1 text-sm font-semibold text-neutral-900 capitalize dark:text-white">
                  {item.priority === "unassigned"
                    ? "Unknown (Fallback)"
                    : item.priority}
                </h4>
                <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Dashboard Card Priorities */}
        <section>
          <div className="mb-6">
            <h3 className="mb-2 flex items-center gap-2 text-xl font-semibold text-neutral-900 dark:text-white">
              <CircleGauge className="h-5 w-5 text-neutral-500" />
              Cards Priority Icons
            </h3>
            <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              Dashboard cards show priority as an icon alone to keep the UI
              clean. The shape tells you the priority, and only High and
              Critical use colour.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {DASHBOARD_CARD_ICONS.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white py-6 transition-all hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
                >
                  <Icon className={`h-8 w-8 ${item.color}`} />

                  <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                    {item.priority}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Submission Time Badges */}
        <section>
          <div className="mb-6">
            <h3 className="mb-2 flex items-center gap-2 text-xl font-semibold text-neutral-900 dark:text-white">
              <Clock className="h-5 w-5 text-neutral-500" />
              Submission Time Badges
            </h3>
            <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              Time labels show how long ago an issue was submitted. They stay
              grey unless an unresolved issue has aged, which turns the label
              amber so it stays on your radar.
            </p>
          </div>

          {/* Expanded to 3 columns on large screens to fit the new state */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Standard Time (Under 7 Days) */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700">
              <div className="mb-5 flex min-h-6.5 flex-wrap gap-3">
                {mockTimes && (
                  <>
                    <RelativeTimeBadge
                      createdAt={mockTimes.recent1}
                      status="open"
                    />
                    <RelativeTimeBadge
                      createdAt={mockTimes.recent2}
                      status="open"
                    />
                  </>
                )}
              </div>
              <h4 className="mb-1 text-sm font-semibold text-neutral-900 dark:text-white">
                Recent Unresolved Issues
              </h4>
              <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                Unresolved issues submitted under 7 days ago stay grey, because
                they are still within the 7 day window.
              </p>
            </div>

            {/* Urgent Time (7+ Days, Open) */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700">
              <div className="mb-5 flex min-h-6.5 flex-wrap gap-3">
                {mockTimes && (
                  <>
                    <RelativeTimeBadge
                      createdAt={mockTimes.aging1}
                      status="open"
                    />
                    <RelativeTimeBadge
                      createdAt={mockTimes.aging2}
                      status="open"
                    />
                  </>
                )}
              </div>
              <h4 className="mb-1 text-sm font-semibold text-neutral-900 dark:text-white">
                Aging Unresolved Issues
              </h4>
              <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                Once an unresolved issue hits 7 days, the label turns amber to
                flag it for attention.
              </p>
            </div>

            {/* Resolved/Closed Issues (Any Age) */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-neutral-300 hover:shadow-sm sm:col-span-2 lg:col-span-1 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700">
              <div className="mb-5 flex min-h-6.5 flex-wrap gap-3">
                {mockTimes && (
                  <>
                    {/* Using the same aging timestamps, but changing the status */}
                    <RelativeTimeBadge
                      createdAt={mockTimes.aging1}
                      status="resolved"
                    />
                    <RelativeTimeBadge
                      createdAt={mockTimes.aging2}
                      status="closed"
                    />
                  </>
                )}
              </div>
              <h4 className="mb-1 text-sm font-semibold text-neutral-900 dark:text-white">
                Processed Issues
              </h4>
              <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                A resolved or closed issue stays grey, however old the
                submission is.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Quick tip callout (consistent with IssuesDocs) */}
      <div className="mt-12 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-950/30">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
            Pro tip
          </p>
          <p className="mt-0.5 text-sm text-blue-700 dark:text-blue-400">
            If an issue requires higher urgency than its default assigned
            priority allows, contact your IT Administrator to request a priority
            adjustment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ColorCodes;
