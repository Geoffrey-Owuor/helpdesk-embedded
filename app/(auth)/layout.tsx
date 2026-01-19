import { requireSession } from "@/lib/Auth";
import { redirect } from "next/navigation";
import { generateUserRoute } from "@/utils/Validators";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const user = await requireSession();
  if (user) {
    const userRouteName = generateUserRoute(user.username);
    redirect(`/${userRouteName}`);
  }

  return <div>{children}</div>;
};

export default layout;
