import { requireSession } from "@/lib/Auth";
import { redirect } from "next/navigation";
import { UserProvider } from "@/contexts/UserContext";
import DashboardLayoutShell from "@/components/Navigation/DashboardLayoutShell";

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
