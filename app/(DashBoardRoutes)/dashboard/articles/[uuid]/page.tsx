import ViewArticle from "@/components/Modules/ArticlesPage/ViewArticle";
import { Metadata } from "next";

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

  return <ViewArticle uuid={uuid} />;
};

export default page;
