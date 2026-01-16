import { requireSession } from "@/lib/Auth";
import { redirect } from "next/navigation";
import LogOutButton from "@/components/Modules/LogOutButton";

const page = async () => {
  const user = await requireSession();
  if (!user) redirect("/login");
  return (
    <div>
      This is a protected page
      <div className="mb-5">
        Welcome, {user.userId} {user.email} {user.department} {user.role}{" "}
        {user.username}
      </div>
      <div className="h-4 w-40">
        <LogOutButton />
      </div>
    </div>
  );
};

export default page;
