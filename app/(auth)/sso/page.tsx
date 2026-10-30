import { redirect } from "next/navigation";
import { requireTemporarySession } from "@/lib/Auth";
import SSOCompletionForm from "@/components/AuthPages/SSOCompletionForm";
import { afterLoginPath, NEXT_PARAM } from "@/lib/loginRedirect";

export default async function SSOCompletionPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Check Auth and redirect if there is no valid user
  const tempUser = await requireTemporarySession();
  if (!tempUser) redirect("/login");

  // The page that sent them to login (passed on by the Microsoft callback)
  const next = (await searchParams)[NEXT_PARAM];
  const redirectPath = afterLoginPath(typeof next === "string" ? next : null);

  return (
    // Pass the secure email down to your client component
    <SSOCompletionForm
      email={tempUser.email}
      name={tempUser.username}
      redirectPath={redirectPath}
    />
  );
}
