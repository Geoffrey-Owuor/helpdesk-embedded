import { requireSession } from "@/lib/Auth";
import { redirect } from "next/navigation";
import { UserProvider } from "@/contexts/UserContext";
import DashboardLayoutShell from "@/components/Navigation/DashboardLayoutShell";
import { Metadata } from "next";

export const generateMetadata = async (): Promise<Metadata> => {
  const user = await requireSession();

  if (!user) return { title: "Dashboard" };

  const role = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return {
    title: {
      default: `${user.username}'s Dashboard - ${role}`,
      template: `%s - ${user.username}'s Dashboard`,
    },
    description: "The default user dashboard page",
  };
};

const layout = async ({ children }: { children: React.ReactNode }) => {
  // Check Auth and redirect if there is no valid user
  const user = await requireSession();
  if (!user) redirect("/login");

  return (
    <UserProvider user={user}>
      <DashboardLayoutShell>{children}</DashboardLayoutShell>
    </UserProvider>
  );
};

export default layout;
