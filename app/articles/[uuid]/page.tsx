import ViewArticle from "@/components/Modules/ArticlesPage/ViewArticle";
import { Metadata } from "next";
import { getArticleMeta } from "@/lib/articles/getArticleMeta";
import { metaDescription } from "@/lib/metadata";
import HomeNavBar from "@/components/Navigation/HomeNavBar";
import Footer from "@/components/Home/Footer";

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

  return (
    <div
      id="article-content"
      className="layout-scrollbar home-container h-dvh overflow-y-auto bg-white dark:bg-neutral-950"
    >
      <div className="mx-auto flex min-h-full max-w-6xl flex-col 2xl:max-w-7xl">
        <HomeNavBar />
        <div className="flex-1">
          <ViewArticle uuid={uuid} />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default page;
