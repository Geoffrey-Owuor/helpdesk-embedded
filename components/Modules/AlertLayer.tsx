"use client";

import Alerts from "@/components/Modules/Alert";
import { useModalStackStore } from "@/store/useModalStackStore";

// Holds the app's alerts above everything, stacked in one corner. On phones a
// modal fills the screen or docks to the bottom with its actions there, so the
// layer moves to the top of the screen while one is open.
// useFocusTrapping finds this layer by its attribute, so an open modal's Tab
// cycle can reach the alerts' buttons.
const AlertLayer = () => {
  const isModalOpen = useModalStackStore((state) => state.stack.length > 0);

  return (
    <div
      data-alert-layer
      className={`pointer-events-none fixed right-4 left-4 z-9999 flex flex-col gap-2 sm:top-auto sm:right-6 sm:bottom-6 sm:left-auto sm:w-auto sm:max-w-md sm:min-w-[320px] ${
        isModalOpen
          ? "top-[max(1rem,env(safe-area-inset-top))]"
          : "bottom-[max(1rem,env(safe-area-inset-bottom))]"
      }`}
    >
      <Alerts />
    </div>
  );
};

export default AlertLayer;
