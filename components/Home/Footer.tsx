"use client";

import Image from "next/image";
import Link from "next/link";
import { assets } from "@/public/assets";
import { currentYear } from "@/public/assets";
import { Star } from "lucide-react";
import { useLoadingStore } from "@/store/useLoadingStore";
import { usePathname } from "next/navigation";
import { DbStatusPill } from "../Modules/DbStatus/DbStatusPill";

const footerLinks = [
  { name: "Changelog", href: "/changelog" },
  { name: "Manual", href: "/manual#user-manual" },
  { name: "Report a Bug", href: "/manual#bug-report" },
  { name: "Knowledge Base", href: "/articles" },
];

const Footer = () => {
  const pathname = usePathname();
  const setLoadingLine = useLoadingStore((state) => state.setLoadingLine);

  const handleLoadingClick = (href: string) => {
    const originalHref = href.split("#")[0];

    if (originalHref === pathname) return;

    setLoadingLine(true);
  };
  return (
    <footer>
      <div className="custom:px-8 mx-auto max-w-6xl border-t border-neutral-100 p-6 dark:border-neutral-900">
        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-0">
          {/* Brand Column */}
          <div className="flex max-w-sm flex-col gap-3">
            <div className="flex items-center gap-1">
              <div className="-ml-1.5 h-6.5 w-6.5">
                <Image
                  src={assets.hotpoint_black_logo}
                  alt="IssueDesk Logo"
                  className="object-contain dark:invert"
                  loading="eager"
                  sizes="32px"
                />
              </div>
              <span className="text-xl font-semibold text-neutral-900 dark:text-white">
                IssueDesk
              </span>
            </div>
            <p className="text-base leading-7 text-neutral-600 dark:text-neutral-400">
              The centralized internal tool for managing user issues, assigning
              ownership, and closing the loop on issues.
            </p>
          </div>

          {/* Footer Links */}
          <div className="mt-2 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8">
            {/* Product Links */}
            <div>
              <h3 className="text-base leading-6 font-semibold text-neutral-900 dark:text-white">
                Product
              </h3>
              <ul role="list" className="mt-4 space-y-3">
                {footerLinks.map((item) => (
                  <li key={item.name}>
                    <Link
                      onClick={() => handleLoadingClick(item.href)}
                      href={item.href}
                      className="text-base text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div>
              <h3 className="text-base leading-6 font-semibold text-neutral-900 dark:text-white">
                Connect with Us
              </h3>
              <p className="mt-4 text-base leading-7 text-neutral-600 dark:text-neutral-400">
                Got questions or feedback? Reach out to{" "}
                <a
                  href="mailto:helpdesk@hotpoint.co.ke"
                  className="text-blue-500 underline hover:text-blue-400"
                >
                  IT
                </a>{" "}
                anytime.
              </p>
              <div className="mt-4">
                <DbStatusPill />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Centered */}
        <div className="mt-10 flex flex-col items-center gap-8 pb-16 md:pb-0">
          <div className="flex w-full flex-col items-center justify-between gap-4 text-sm text-neutral-500 md:flex-row">
            {/* Left Area: Copyright & Attribution */}
            <span className="inline-flex items-center gap-2 leading-5">
              <span>
                &copy; {currentYear} IssueDesk. Hotpoint Appliances Ltd
              </span>
            </span>

            <span className="inline-flex items-center gap-2">
              <a
                href="https://jeff-portfolio-web.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-neutral-700 hover:underline dark:text-neutral-300"
              >
                Jeff
              </a>
              And
              <Link
                href="/it-team"
                className="inline-flex items-center gap-0.5 font-semibold text-neutral-700 hover:underline dark:text-neutral-300"
              >
                <Star className="h-4 w-4" />
                Team
              </Link>
            </span>

            {/* Right Area */}
            <span className="font-mono tracking-[-0.08em]">
              Streamlining support, one issue at a time
            </span>
          </div>

          <span className="text-center font-mono text-6xl leading-none font-black tracking-tighter text-neutral-300 select-none md:text-9xl dark:text-neutral-800">
            ISSUEDESK
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
