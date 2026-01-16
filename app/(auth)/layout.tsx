import { requireSession } from "@/lib/Auth";
import { redirect } from "next/navigation";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const user = await requireSession();
  if (user) redirect("/testroute");

  return <div>{children}</div>;
};

export default layout;
