"use client";
import { createContext, useContext, useMemo } from "react";
import { AuthJWTPayload } from "@/lib/Auth";
import { useAuthSync } from "@/hooks/useAuthSync";
import { useEffect } from "react";

// Shape of the context value
type UserContextValue = AuthJWTPayload | null;

type UserProviderProps = {
  children: React.ReactNode;
  user: AuthJWTPayload;
};

// 2. Pass the type to createContext so it knows what to expect
const UserContext = createContext<UserContextValue>(null);

export const UserProvider = ({ children, user }: UserProviderProps) => {
  // Broadcast login
  useEffect(() => {
    const authChannel = new BroadcastChannel("embed_auth_session_sync");
    authChannel.postMessage({ action: "EMBEDLOGIN", userId: user.userId });
    authChannel.close();
  }, [user.userId]);

  useAuthSync(user);

  const value = useMemo(
    () => ({
      userId: user.userId,
      email: user.email,
      username: user.username,
      role: user.role,
      department: user.department,
      isSuper: user.isSuper,
    }),
    [
      user.userId,
      user.email,
      user.username,
      user.role,
      user.department,
      user.isSuper,
    ],
  );
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
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
