import { redirect } from "next/navigation";
import { requireTemporarySession } from "@/lib/Auth";
import SSOCompletionForm from "@/components/AuthPages/SSOCompletionForm";

export default async function SSOCompletionPage() {
  // Check Auth and redirect if there is no valid user
  const tempUser = await requireTemporarySession();
  if (!tempUser) redirect("/login");

  return (
    // Pass the secure email down to your client component
    <SSOCompletionForm email={tempUser.email} name={tempUser.username} />
  );
}
