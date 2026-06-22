import HomeArticlesPage from "@/components/Modules/ArticlesPage/HomeArticlesPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge Base",
  description: "Knowledge base for various published articles",
};
const page = () => {
  return <HomeArticlesPage />;
};

export default page;
