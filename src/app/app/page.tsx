import { AppContent } from "@/components/app/AppContent";
import { getAuthState } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AppPage() {
  const authState = await getAuthState();

  if (authState.state === "no-session") {
    redirect("/");
  }

  if (authState.state === "incomplete-profile") {
    redirect("/onboarding");
  }

  return <AppContent profile={authState.profile} />;
}
