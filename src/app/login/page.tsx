import { redirect } from "next/navigation";

// Alte Login-Route → umleiten zum neuen Wizard
export default function LoginPage() {
  redirect("/");
}
