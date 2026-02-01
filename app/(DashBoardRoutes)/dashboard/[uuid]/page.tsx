import { IssuePage } from "@/components/Modules/IssuePage/IssuePage";

type issueParams = {
  params: Promise<{ uuid: string }>;
};
const page = async ({ params }: issueParams) => {
  const { uuid } = await params;
  return (
    <>
      <IssuePage uuid={uuid} />
    </>
  );
};

export default page;
