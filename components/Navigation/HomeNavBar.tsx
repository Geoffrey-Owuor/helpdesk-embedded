"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import ThemeToggle from "../Themes/ThemeToggle";
import { assets } from "@/public/assets";

const HomeNavBar = () => {
  const [scrolledUp, setScrolledUp] = useState(true); // Track if user scrolled up
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 0);
      setScrolledUp(currentScrollY < lastScrollY.current);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-200 ${scrolledUp ? "translate-y-0" : "-translate-y-full"} ${isScrolled ? "custom-blur bg-white/70 dark:bg-neutral-950/70" : "bg-transparent"}`}
    >
      <nav className="custom:px-8 mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8">
            <Image
              src={assets.issue_desk_image}
              alt="Issue Desk Logo"
              className="dark:invert"
            />
          </div>
          <span className="hidden text-xl font-semibold text-black sm:flex dark:text-white">
            Issue Desk
          </span>
        </Link>
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
