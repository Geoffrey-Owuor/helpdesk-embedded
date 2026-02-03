import { IssuePage } from "@/components/Modules/IssuePage/IssuePage";
import { Metadata } from "next";

type issuePageProps = {
  params: Promise<{ uuid: string }>;
  searchParams: Promise<{ title: string; description: string }>;
};

// Generating page metadata
export const generateMetadata = async ({
  searchParams,
}: issuePageProps): Promise<Metadata> => {
  // get the searchParams values
  const { title, description } = await searchParams;

  // return the constructed metadata
  return {
    title: title || "Issue Title",
    description: description || "Issue Description",
  };
};

const page = async ({ params }: issuePageProps) => {
  const { uuid } = await params;
  return (
    <>
      <IssuePage uuid={uuid} />
    </>
  );
};

export default page;
