import { HomeContent } from "@/components/home/HomeContent";
import { requireCompleteProfile } from "@/lib/auth";

export default async function HomePage() {
  const { profile } = await requireCompleteProfile();
  return <HomeContent profile={profile!} />;
}
