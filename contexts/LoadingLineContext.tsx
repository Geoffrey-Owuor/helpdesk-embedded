"use client";
import {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

type LoadingLineProviderValues = {
  loadingLine: boolean;
  setLoadingLine: Dispatch<SetStateAction<boolean>>;
};

const LoadingLineContext = createContext<LoadingLineProviderValues | null>(
  null,
);

export const LoadingLineProvider = ({ children }: { children: ReactNode }) => {
  const [loadingLine, setLoadingLine] = useState(false);

  const values = useMemo(
    () => ({
      loadingLine,
      setLoadingLine,
    }),
    [loadingLine],
  );

  return (
    <LoadingLineContext.Provider value={values}>
      {children}
    </LoadingLineContext.Provider>
  );
};

export const useLoadingLine = () => {
  const context = useContext(LoadingLineContext);

  if (!context)
    throw new Error("useLoadingLine must be used within a LoadingLineProvider");

  return context;
};
