"use client";

import { useState } from "react";

import {
  BookOpen,
  ChevronRight,
  LayoutDashboard,
  Lightbulb,
  Mail,
  MessageSquareText,
  PlusSquare,
  UserRoundPlus,
} from "lucide-react";

const steps = [
  {
    id: 1,
    icon: <UserRoundPlus className="h-5 w-5" />,
    title: "Create an Account or Log In",
    description:
      "If you're new to IssueDesk, head to the registration page to create your account. Existing users can log in directly with their credentials.",
    detail: (
      <ul className="mt-3 space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
        <li className="flex items-start gap-2">
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
          Navigate to{" "}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs dark:bg-neutral-800">
            /register
          </code>{" "}
          to sign up with your work email.
        </li>
        <li className="flex items-start gap-2">
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
          Already have an account? Go to{" "}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs dark:bg-neutral-800">
            /login
          </code>{" "}
          and enter your credentials.
        </li>
        <li className="flex items-start gap-2">
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
          Once authenticated, you&apos;ll be redirected to the main dashboard.
        </li>
      </ul>
    ),
  },
  {
    id: 2,
    icon: <PlusSquare className="h-5 w-5" />,
    title: "Submit a New Issue",
    description:
      "Click the 'New Issue' button in the left sidebar to open the issue submission form. Fill in the title, description, and any relevant details before submitting.",
    detail: (
      <ul className="mt-3 space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
        <li className="flex items-start gap-2">
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
          Locate{" "}
          <strong className="font-medium text-neutral-700 dark:text-neutral-300">
            New Issue
          </strong>{" "}
          in the left navigation sidebar.
        </li>
        <li className="flex items-start gap-2">
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
          Provide a clear, concise title and a detailed description of the
          problem you&apos;re experiencing.
        </li>
        <li className="flex items-start gap-2">
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
          You can review the details then hit{" "}
          <strong className="font-medium text-neutral-700 dark:text-neutral-300">
            Submit.
          </strong>
        </li>
      </ul>
    ),
  },
  {
    id: 3,
    icon: <LayoutDashboard className="h-5 w-5" />,
    title: "Track Your Issue on the Dashboard",
    description:
      "After submission, your issue appears instantly in the dashboard content area. You can monitor its current status - Open, Resolved, or Closed - at a glance.",
    detail: (
      <ul className="mt-3 space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
        <li className="flex items-start gap-2">
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
          The dashboard lists all issues you&apos;ve submitted with live status
          indicators.
        </li>
        <li className="flex items-start gap-2">
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
          Click on any issue row to open its detail page for a full view.
        </li>
        <li className="flex items-start gap-2">
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
          Use filters to sort by status, date, or priority to stay organized.
        </li>
      </ul>
    ),
  },
  {
    id: 4,
    icon: <Mail className="h-5 w-5" />,
    title: "Receive Email Notifications",
    description:
      "You'll get an email confirmation as soon as your issue is submitted. Follow-up emails are sent automatically whenever an assigned agent updates or acts on your issue.",
    detail: (
      <ul className="mt-3 space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
        <li className="flex items-start gap-2">
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />A
          submission confirmation is sent immediately to your registered email.
        </li>
        <li className="flex items-start gap-2">
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
          You&apos;ll be notified when an agent is assigned, adds a comment, or
          changes the status.
        </li>
        <li className="flex items-start gap-2">
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />A
          final email is sent when your issue is marked as{" "}
          <strong className="font-medium text-neutral-700 dark:text-neutral-300">
            Resolved.
          </strong>
        </li>
      </ul>
    ),
  },
  {
    id: 5,
    icon: <MessageSquareText className="h-5 w-5" />,
    title: "Add Comments to an Issue",
    description:
      "Open any issue from the dashboard to access its detail page. Scroll to the Comments section to add context, ask follow-up questions, or provide additional information directly on the issue thread.",
    detail: (
      <ul className="mt-3 space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
        <li className="flex items-start gap-2">
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
          Click on an issue title in the dashboard to open the issue detail
          view.
        </li>
        <li className="flex items-start gap-2">
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
          Scroll to the{" "}
          <strong className="font-medium text-neutral-700 dark:text-neutral-300">
            Comments
          </strong>{" "}
          section at the bottom of the page.
        </li>
        <li className="flex items-start gap-2">
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
          Type your message in the comment box - great for sharing extra details
          or responding to agent queries.
        </li>
        <li className="flex items-start gap-2">
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
          All comments are timestamped and visible to both you and the assigned
          agent.
        </li>
      </ul>
    ),
  },
];

const UserManual = () => {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div id="user-manual" className="scroll-mt-24">
      {/* Section header */}
      <div className="mb-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
          <BookOpen className="h-3.5 w-3.5" />
          Getting Started
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl dark:text-white">
          User Manual
        </h2>
        <p className="mt-3 max-w-xl text-base text-neutral-500 dark:text-neutral-400">
          Everything you need to start submitting and tracking issues. Follow
          these steps to get up and running quickly. Click on a step section
          view more details.
        </p>
      </div>

      {/* Steps */}
      <div className="relative">
        <ol className="space-y-4">
          {steps.map((step) => {
            const isOpen = expanded === step.id;
            return (
              <li key={step.id}>
                <button
                  onClick={() => setExpanded(isOpen ? null : step.id)}
                  className="group w-full rounded-xl border border-neutral-200 bg-white p-5 text-left transition-all hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-start gap-4">
                    {/* Step number + icon */}
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-500 transition-colors group-hover:border-neutral-300 group-hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:group-hover:border-neutral-700 dark:group-hover:text-white">
                      {step.icon}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-neutral-400 dark:text-neutral-600">
                            {String(step.id).padStart(2, "0")}
                          </span>
                          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                            {step.title}
                          </h3>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                        />
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                        {step.description}
                      </p>
                      {isOpen && (
                        <div className="mt-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                          {step.detail}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Quick tip callout */}
      <div className="mt-8 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-950/30">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
            Pro tip
          </p>
          <p className="mt-0.5 text-sm text-blue-700 dark:text-blue-400">
            Keep your issue descriptions specific and actionable - include the
            necessary information, expected vs actual behaviour, and any error
            messages you see. This helps agents resolve your issue faster.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserManual;
