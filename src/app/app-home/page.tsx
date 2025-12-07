import { AppHomeContent } from "@/components/app-home/AppHomeContent";
import { getAuthState } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AppHomePage() {
  const authState = await getAuthState();

  if (authState.state === "no-session") {
    redirect("/");
  }

  if (authState.state === "incomplete-profile") {
    redirect("/onboarding");
  }

  return <AppHomeContent profile={authState.profile} />;
}
