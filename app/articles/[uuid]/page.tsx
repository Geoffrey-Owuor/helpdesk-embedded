import ViewArticle from "@/components/Modules/ArticlesPage/ViewArticle";
import { Metadata } from "next";
import HomeNavBar from "@/components/Navigation/HomeNavBar";
import Footer from "@/components/Home/Footer";

type ArticlePageProps = {
  params: Promise<{ uuid: string }>;
  searchParams: Promise<{ title: string; subtitle: string }>;
};

// Generate the page metadata
export const generateMetadata = async ({
  searchParams,
}: ArticlePageProps): Promise<Metadata> => {
  //Getting the searchParams values
  const { title, subtitle } = await searchParams;

  //   Return the constructed metadata
  return {
    title: title || "Article Title",
    description: subtitle || "Artcile Subtitle",
  };
};

const page = async ({ params }: ArticlePageProps) => {
  const { uuid } = await params;

  return (
    <div
      id="article-content"
      className="layout-scrollbar home-container h-screen overflow-y-auto bg-white dark:bg-neutral-950"
    >
      <div className="mx-auto max-w-6xl 2xl:max-w-7xl">
        <HomeNavBar />
        <ViewArticle uuid={uuid} />
        <Footer />
      </div>
    </div>
  );
};

export default page;
