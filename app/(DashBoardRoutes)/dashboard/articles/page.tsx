import Articles from "@/components/Modules/ArticlesPage/Articles";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Articles page showing published articles area, and a form for publishing an article",
};

const page = () => {
  return <Articles />;
};

export default page;
