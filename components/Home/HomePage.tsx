"use client";
import HomeNavBar from "@/components/Navigation/HomeNavBar";
import Hero from "@/components/Home/Hero";
import { useEffect, useState } from "react";
import QuickCreateButton from "./QuickCreateButton";
import HomePageAlert from "../Modules/HomePageAlert";
import HowItWorks from "./HowItWorks";
import Features from "./Features";
import HomeNews from "./HomeNews";
import ExploreCta from "./ExploreCta";
import Footer from "@/components/Home/Footer";

const HomePage = () => {
  const [showManualAlert, setShowManualAlert] = useState(false);

  // Trigger the alert after 1 second
  useEffect(() => {
    // 1. Check if the user has already dismissed the alert in the current session
    const hasSeenAlert = sessionStorage.getItem("hasSeenManualAlert");

    // 2. If they haven't seen it, trigger the 1-second timer
    if (!hasSeenAlert) {
      const timeout = setTimeout(() => setShowManualAlert(true), 1000);
      return () => clearTimeout(timeout);
    }
  }, []);

  // 3. A custom close handler that updates both React state and sessionStorage
  const handleCloseAlert = () => {
    setShowManualAlert(false);
    sessionStorage.setItem("hasSeenManualAlert", "true");
  };

  return (
    <div className="layout-scrollbar home-container h-screen overflow-y-auto scroll-smooth bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl 2xl:max-w-7xl">
        <HomeNavBar />

        {/* Headline, CTAs and the dashboard preview */}
        <Hero />

        {/* The three-step submission journey */}
        <HowItWorks />

        {/* Capability highlights */}
        <Features />

        {/* The homepage news component here */}
        <HomeNews />

        {/* Closing call to action */}
        <ExploreCta />

        {/* The quick create button */}
        <QuickCreateButton />

        {/* The manual alert */}
        <HomePageAlert isOpen={showManualAlert} onClose={handleCloseAlert} />
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
