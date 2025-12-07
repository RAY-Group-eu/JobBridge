import { getAuthState } from "@/lib/auth";
import { redirect } from "next/navigation";
import AuthBridge from "@/components/AuthBridge";

export default async function LandingPage() {
  const authState = await getAuthState();
  
  // Wenn ready → zu /app-home
  if (authState.state === "ready") {
    redirect("/app-home");
  }
  
  // Ansonsten Wizard anzeigen (no-session oder incomplete-profile)
  return <AuthBridge authState={authState} />;
}
