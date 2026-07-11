import Register from "@/components/AuthPages/Register/Register";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "HelpDesk registration page",
};

const page = () => {
  return <Register />;
};

export default page;
