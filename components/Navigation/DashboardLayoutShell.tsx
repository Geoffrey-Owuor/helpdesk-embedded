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
      <div className="w-14">
        <LogOutButton />
      </div>
    </div>
  );
};

export default DashboardLayoutShell;
