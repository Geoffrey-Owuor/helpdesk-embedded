"use client";
import { useQuery } from "@tanstack/react-query";
import { getUserArticles } from "@/serverActions/GetUserArticles";
import ArticlesCardData from "./ArticlesCardData";
import ArticleSearchFilter, { FilterPill } from "./ArticleSearchFilter";
import { useState, useMemo } from "react";

const UserArticlesWrapper = () => {
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
    <>
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
    </>
  );
};

export default UserArticlesWrapper;
