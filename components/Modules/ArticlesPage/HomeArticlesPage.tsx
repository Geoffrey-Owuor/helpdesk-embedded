"use client";
import HomeNavBar from "@/components/Navigation/HomeNavBar";
import Footer from "@/components/Home/Footer";
import { useQuery } from "@tanstack/react-query";
import { getUserArticles } from "@/serverActions/GetUserArticles";
import ArticlesCardData from "./ArticlesCardData";
import ArticleSearchFilter, { FilterPill } from "./ArticleSearchFilter";

import { useState, useMemo } from "react";
import { BookOpen } from "lucide-react";

export interface ArticlesCardValues {
  article_id: string;
  article_type: string;
  article_title: string;
  article_subtitle: string;
  article_content: string;
  article_read_time: string;
  article_updated_at: string;
  user_department: string;
  user_id: string;
  user_name: string;
  can_edit: boolean;
}

const HomeArticlesPage = () => {
  const {
    data: homeArticles = [],
    isPending: loading,
    refetch: refetchArticles,
  } = useQuery({
    queryKey: ["HomeArticlesData"],
    queryFn: async () => getUserArticles(),
  });

  // State to hold ONLY the active filter rules, not the data itself
  const [committedFilters, setCommittedFilters] = useState<FilterPill[]>([]);

  // Calculate filtered articles on the fly. No useEffect lag!
  const filteredArticles = useMemo(() => {
    if (committedFilters.length === 0) return homeArticles;

    return homeArticles.filter((article) => {
      return committedFilters.every((pill) => {
        if (pill.category === "department")
          return article.user_department === pill.value;
        if (pill.category === "article_type")
          return article.article_type === pill.value;
        if (pill.category === "publisher") {
          return article.user_name
            .toLowerCase()
            .includes(pill.value.toLowerCase());
        }
        return true;
      });
    });
  }, [homeArticles, committedFilters]);

  const refetchHomeArticles = async () => {
    await refetchArticles();
  };

  return (
    <div className="layout-scrollbar home-container h-screen overflow-y-auto bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl 2xl:max-w-7xl">
        <HomeNavBar />
        <div className="custom:px-8 px-4 py-6 md:py-3.5">
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 text-2xl font-semibold text-neutral-900 dark:text-white">
              <BookOpen className="mt-1 h-6 w-6" />
              Knowledge Base
            </span>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Browse and search through published content.
            </p>
          </div>

          {/* Pass the state and setter down to the filter component */}
          <ArticleSearchFilter
            articles={homeArticles}
            committedFilters={committedFilters}
            setCommittedFilters={setCommittedFilters}
          />

          <ArticlesCardData
            articles={filteredArticles} // Derived seamlessly
            loading={loading}
            refetchData={refetchHomeArticles}
          />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default HomeArticlesPage;
