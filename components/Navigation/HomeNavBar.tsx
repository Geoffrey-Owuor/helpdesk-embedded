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
    // Select all elements with the class "home-container"
    const containers = document.querySelectorAll(".home-container");

    if (containers.length === 0) return;

    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement; // cast to HTMLElement
      const currentScrollY = target.scrollTop;
      setIsScrolled(currentScrollY > 0);

      if (currentScrollY <= 0) {
        setScrolledUp(true);
      } else if (currentScrollY > lastScrollY.current) {
        setScrolledUp(false);
      } else if (currentScrollY < lastScrollY.current) {
        setScrolledUp(true);
      }
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

  return (
    <div
      className={`sticky top-0 right-0 left-0 z-50 transition-all duration-200 ${scrolledUp ? "translate-y-0" : "-translate-y-full"} ${isScrolled ? "custom-blur bg-white/70 dark:bg-neutral-950/70" : "bg-transparent"}`}
    >
      <nav className="custom:px-8 mx-auto flex h-16 max-w-6xl items-center justify-between px-4 2xl:max-w-7xl">
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
