"use client";
import { createContext, useContext } from "react";
import { AuthJWTPayload } from "@/lib/Auth";

// Shape of the context value
type UserContextValue = AuthJWTPayload | null;

type UserProviderProps = {
  children: React.ReactNode;
  user: AuthJWTPayload;
};

// 2. Pass the type to createContext so it knows what to expect
const UserContext = createContext<UserContextValue>(null);

export const UserProvider = ({ children, user }: UserProviderProps) => {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

// 3. Export a custom hook to make consuming easy
export const useUser = () => {
  const context = useContext(UserContext);

  // Optional: Throw error if used outside provider to ensure type safety
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
};
