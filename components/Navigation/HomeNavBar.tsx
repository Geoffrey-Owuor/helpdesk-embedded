"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import ThemeToggle from "../Themes/ThemeToggle";
import HomePagesLogo from "../Modules/HomePagesLogo";

const HomeNavBar = () => {
  const [scrolledUp, setScrolledUp] = useState(true); // Track if user scrolled up
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const container = document.getElementById("home-container");
    if (!container) return;

    const handleScroll = () => {
      const currentScrollY = container.scrollTop;
      setIsScrolled(currentScrollY > 0);

      // 2. Safely determine scroll direction
      if (currentScrollY <= 0) {
        // Always show the navbar when at the absolute top
        setScrolledUp(true);
      } else if (currentScrollY > lastScrollY.current) {
        // Scrolling DOWN -> Hide the navbar
        setScrolledUp(false);
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling UP -> Show the navbar
        setScrolledUp(true);
      }
      lastScrollY.current = currentScrollY;
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`sticky top-0 right-0 left-0 z-50 transition-all duration-200 ${scrolledUp ? "translate-y-0" : "-translate-y-full"} ${isScrolled ? "custom-blur bg-white/70 dark:bg-neutral-950/70" : "bg-transparent"}`}
    >
      <nav className="custom:px-8 mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* App Logo */}
        <HomePagesLogo />
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
