import { requireSession } from "@/lib/Auth";
import { redirect } from "next/navigation";
import { UserProvider } from "@/contexts/UserContext";

type dashboardParams = {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
};
const layout = async ({ children, params }: dashboardParams) => {
  // Check Auth
  const user = await requireSession();
  if (!user) redirect("/login");

  // Await params before accessing properties
  const { username } = await params;

  if (!username) redirect("/login");

  // Check if session username matches the url params username
  if (user.username !== username) redirect("/login");

  return <UserProvider user={user}>{children}</UserProvider>;
};

export default layout;
