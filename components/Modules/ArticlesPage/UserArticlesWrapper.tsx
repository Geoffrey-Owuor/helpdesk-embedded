"use client";
import { useQuery } from "@tanstack/react-query";
import { getUserArticles } from "@/serverActions/GetUserArticles";
import ArticlesCardData from "./ArticlesCardData";
import { useUser } from "@/contexts/UserContext";

const UserArticlesWrapper = () => {
  const { userId } = useUser();
  //Get the user's articles
  const {
    data: userArticles = [],
    isPending: loading,
    refetch: refetchUserArticles,
  } = useQuery({
    queryKey: ["UserArticlesInfo"],
    queryFn: async () => getUserArticles(userId),
  });

  const refetchData = async () => {
    refetchUserArticles();
  };

  return (
    <ArticlesCardData
      articles={userArticles}
      loading={loading}
      refetchData={refetchData}
    />
  );
};

export default UserArticlesWrapper;
