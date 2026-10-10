import ViewArticle from "@/components/Modules/ArticlesPage/ViewArticle";
import { Metadata } from "next";
import { getArticleMeta } from "@/lib/articles/getArticleMeta";
import { metaDescription } from "@/lib/metadata";

type ArticlePageProps = {
  params: Promise<{ uuid: string }>;
};

// Generate the page metadata from the article itself
export const generateMetadata = async ({
  params,
}: ArticlePageProps): Promise<Metadata> => {
  const { uuid } = await params;
  const article = await getArticleMeta(uuid);

  if (!article) return { title: "Article not found" };

  return {
    title: article.article_title,
    description: metaDescription(article.article_subtitle),
  };
};

const page = async ({ params }: ArticlePageProps) => {
  const { uuid } = await params;

  return <ViewArticle uuid={uuid} />;
};

export default page;
