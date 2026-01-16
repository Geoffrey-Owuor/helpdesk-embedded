import { requireSession } from "@/lib/Auth";
import { redirect } from "next/navigation";

const page = async () => {
  const user = await requireSession();
  if (!user) redirect("/login");
  return <div>This is a protected page</div>;
};

export default page;
