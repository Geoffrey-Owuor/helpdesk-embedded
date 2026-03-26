import Login from "@/components/AuthPages/Login";
import { Metadata } from "next";
import SuspenseSkeleton from "@/components/Skeletons/SuspenseSkeleton";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Login",
  description: "IssueDesk login page",
};

const page = () => {
  return (
    <Suspense fallback={<SuspenseSkeleton />}>
      <Login />
    </Suspense>
  );
};

export default page;
