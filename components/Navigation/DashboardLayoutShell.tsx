"use client";
import { useUser } from "@/contexts/UserContext";
import LogOutButton from "../Modules/LogOutButton";

const DashboardLayoutShell = () => {
  const user = useUser();
  return (
    <div>
      <div className="mb-5">
        Welcome, {user?.userId} {user?.email} {user?.department} {user?.role}{" "}
        {user?.username}
      </div>
      <LogOutButton />
    </div>
  );
};

export default DashboardLayoutShell;
