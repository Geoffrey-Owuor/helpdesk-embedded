import Login from "@/components/AuthPages/Login";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "IssueDesk login page",
};

const page = () => {
  return <Login />;
};

export default page;
