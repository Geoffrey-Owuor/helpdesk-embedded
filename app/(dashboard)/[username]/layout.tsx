import { requireSession } from "@/lib/Auth";
import { redirect } from "next/navigation";
import { generateUserRoute } from "@/utils/Validators";
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

  // Generate user route name from user object
  const userRouteName = generateUserRoute(user.username);

  // Check if session username matches the url params username
  if (username !== userRouteName) redirect("/login");

  return <UserProvider user={user}>{children}</UserProvider>;
};

export default layout;
