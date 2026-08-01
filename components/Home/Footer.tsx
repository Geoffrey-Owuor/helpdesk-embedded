"use client";

import Image from "next/image";
import Link from "next/link";
import { assets } from "@/public/assets";
import { currentYear } from "@/public/assets";
import { ArrowUp, Mail } from "lucide-react";
import { useLoadingStore } from "@/store/useLoadingStore";
import { usePathname } from "next/navigation";
import { DbStatusPill } from "../Modules/DbStatus/DbStatusPill";

const linkGroups = [
  {
    heading: "Product",
    links: [
      { name: "User Manual", href: "/manual#user-manual" },
      { name: "Issue Types", href: "/manual#issues-docs" },
      { name: "Color Codes", href: "/manual#color-codes" },
      { name: "Changelog", href: "/changelog" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { name: "Knowledge Base", href: "/articles" },
      { name: "IT Team", href: "/it-team" },
      { name: "Report a Bug", href: "/manual#bug-report" },
    ],
  },
  {
    heading: "Account",
    links: [
      { name: "Sign In", href: "/login" },
      { name: "Register", href: "/register" },
    ],
  },
];

const Footer = () => {
  const pathname = usePathname();
  const setLoadingLine = useLoadingStore((state) => state.setLoadingLine);

  const handleLoadingClick = (href: string) => {
    const originalHref = href.split("#")[0];

    if (originalHref === pathname) return;

    setLoadingLine(true);
  };

  // Every page that renders this footer scrolls inside a ".home-container"
  const handleScrollToTop = () => {
    document
      .querySelectorAll(".home-container")
      .forEach((container) =>
        container.scrollTo({ top: 0, behavior: "smooth" }),
      );
  };

  return (
    <footer>
      <div className="custom:px-8 mx-auto max-w-6xl border-t border-neutral-100 px-4 pt-12 pb-6 2xl:max-w-7xl dark:border-neutral-900">
        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Brand Column */}
          <div className="flex max-w-sm flex-col gap-4 lg:col-span-5">
            <div className="flex items-center gap-1">
              <div className="-ml-1.5 h-6.5 w-6.5">
                <Image
                  src={assets.hotpoint_black_logo}
                  alt="HelpDesk Logo"
                  className="object-contain dark:invert"
                  loading="eager"
                  sizes="32px"
                />
              </div>
              <span className="text-xl font-semibold text-neutral-900 dark:text-white">
                HelpDesk
              </span>
            </div>

            <p className="text-base leading-7 text-neutral-600 dark:text-neutral-400">
              A centralized helpdesk for reporting issues, assigning ownership,
              tracking progress, and ensuring every issue reaches resolution.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <DbStatusPill />
              <a
                href="mailto:helpdesk@hotpoint.co.ke"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-white"
              >
                <Mail className="h-3.5 w-3.5" />
                Email IT
              </a>
            </div>
          </div>

          {/* Footer Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {linkGroups.map((group) => (
              <div key={group.heading}>
                <h3 className="text-xs font-semibold tracking-widest text-neutral-400 uppercase dark:text-neutral-600">
                  {group.heading}
                </h3>
                <ul role="list" className="mt-4 space-y-3">
                  {group.links.map((item) => (
                    <li key={item.name}>
                      <Link
                        onClick={() => handleLoadingClick(item.href)}
                        href={item.href}
                        className="text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center gap-8 pb-16 md:pb-0">
          <div className="flex w-full flex-col items-center justify-between gap-4 border-t border-neutral-100 pt-6 text-sm text-neutral-500 md:flex-row dark:border-neutral-900">
            {/* Left Area: Copyright & Attribution */}
            <span className="leading-5">
              &copy; {currentYear} HelpDesk. Hotpoint Appliances Ltd
            </span>

            {/* Middle Area */}
            <span className="font-mono tracking-[-0.08em]">
              Streamlining support, one issue at a time
            </span>

            {/* Right Area */}
            <button
              onClick={handleScrollToTop}
              className="group inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-white"
            >
              Back to top
              <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>

          {/* Oversized wordmark, fading into the page */}
          <span
            aria-hidden
            className="bg-linear-to-b from-neutral-300 to-neutral-100 bg-clip-text text-center font-mono text-6xl leading-none font-black tracking-tighter text-transparent select-none md:text-9xl dark:from-neutral-800 dark:to-neutral-950"
          >
            HelpDesk
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
