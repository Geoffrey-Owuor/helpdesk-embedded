"use client";

import HomeNavBar from "@/components/Navigation/HomeNavBar";
import Footer from "@/components/Home/Footer";
import { useQuery } from "@tanstack/react-query";
import { getUserArticles } from "@/serverActions/GetUserArticles";
import ArticlesCardData from "./ArticlesCardData";

const HomeArticlesPage = () => {
  const {
    data: homeArticles = [],
    isPending: loading,
    refetch: refetchArticles,
  } = useQuery({
    queryKey: ["HomeArticlesData"],
    queryFn: async () => getUserArticles(),
  });

  const refetchHomeArticles = async () => {
    await refetchArticles();
  };
  return (
    <div className="layout-scrollbar home-container h-screen overflow-y-auto scroll-smooth bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl 2xl:max-w-7xl">
        <HomeNavBar />

        <div className="custom:px-8 px-4 py-6">
          {/* Where we place our articles */}
          <ArticlesCardData
            articles={homeArticles}
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
