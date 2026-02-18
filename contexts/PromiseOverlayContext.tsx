"use client";

import {
  useContext,
  createContext,
  useState,
  useMemo,
  Dispatch,
  SetStateAction,
} from "react";

interface PromiseOverlayInfoValues {
  loading: boolean;
  overlaytext: string;
}

type PromiseProviderValues = {
  promiseOverlayInfo: PromiseOverlayInfoValues;
  setPromiseOverlayInfo: Dispatch<SetStateAction<PromiseOverlayInfoValues>>;
};

const PromiseOverlayContext = createContext<PromiseProviderValues | null>(null);

export const PromiseOverlayProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [promiseOverlayInfo, setPromiseOverlayInfo] =
    useState<PromiseOverlayInfoValues>({
      loading: false,
      overlaytext: "",
    });

  // our values
  const values = useMemo(
    () => ({
      promiseOverlayInfo,
      setPromiseOverlayInfo,
    }),
    [promiseOverlayInfo],
  );

  return (
    <PromiseOverlayContext.Provider value={values}>
      {children}
    </PromiseOverlayContext.Provider>
  );
};

export const usePromiseOverlay = () => {
  const context = useContext(PromiseOverlayContext);

  if (!context)
    throw new Error(
      "usePromiseOverlay must be used within a PromiseOverlayProvider",
    );

  return context;
};
