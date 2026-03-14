import Register from "@/components/AuthPages/Register/Register";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "IssueDesk registration page",
};

const page = () => {
  return <Register />;
};

export default page;
