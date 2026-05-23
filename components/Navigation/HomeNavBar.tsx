"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useLoadingStore } from "@/store/useLoadingStore";
import { usePathname } from "next/navigation";
import ThemeToggle from "../Themes/ThemeToggle";
import HomePagesLogo from "../Modules/HomePagesLogo";
import { BookOpen, FileText, GitCommitHorizontal } from "lucide-react";

{
  /* Desktop Nav Links */
}
const navLinks = [
  { href: "/manual", label: "Manual", icon: FileText },
  { href: "/changelog", label: "Changelog", icon: GitCommitHorizontal },
  { href: "/articles", label: "Knowledge Base", icon: BookOpen },
];

const HomeNavBar = () => {
  const setLoadingLine = useLoadingStore((state) => state.setLoadingLine);
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // Select all elements with the class "home-container"
    const containers = document.querySelectorAll(".home-container");

    if (containers.length === 0) return;

    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement; // cast to HTMLElement
      const currentScrollY = target.scrollTop;
      setIsScrolled(currentScrollY > 0);

      lastScrollY.current = currentScrollY;
    };

    // Attach listener to each container
    containers.forEach((container) =>
      container.addEventListener("scroll", handleScroll),
    );

    // Cleanup: remove listeners
    return () => {
      containers.forEach((container) =>
        container.removeEventListener("scroll", handleScroll),
      );
    };
  }, []);

  const handleNavLinkClick = (href: string) => {
    if (pathname === href) return;

    setLoadingLine(true);
  };

  return (
    <div
      className={`sticky top-0 right-0 left-0 z-50 ${isScrolled ? "custom-blur bg-white/70 dark:bg-neutral-950/70" : "bg-transparent"}`}
    >
      <nav className="custom:px-8 mx-auto flex h-16 max-w-6xl items-center justify-between px-4 2xl:max-w-7xl">
        {/* App Logo */}
        <HomePagesLogo />

        {/* Navbar links */}

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              onClick={() => handleNavLinkClick(link.href)}
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm text-black hover:bg-gray-200 dark:text-white dark:hover:bg-neutral-800"
            >
              <link.icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full px-4 py-1.5 text-black hover:bg-gray-200 dark:text-white dark:hover:bg-neutral-800"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-neutral-950 px-4 py-1.5 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default HomeNavBar;
