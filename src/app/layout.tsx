import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const fontSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "JobBridge",
  description:
    "JobBridge – Plattform für sichere Taschengeldjobs und Alltagshilfe.",
};

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { MarketProvider } from "@/components/providers/MarketProvider";
import { TestModeBanner } from "@/components/admin/TestModeBanner";

import { supabaseServer } from "@/lib/supabaseServer";
import { Market } from "@/lib/types";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let defaultMarket: Market | null = null;
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("market_id")
        .eq("id", user.id)
        .single();

      if (profile?.market_id) {
        const { data: marketData } = await supabase
          .from("regions_live")
          .select("id, city, is_live, display_name, brand_prefix")
          .eq("id", profile.market_id)
          .single();

        if (marketData) {
          defaultMarket = {
            id: marketData.id,
            display_name: marketData.display_name || marketData.city,
            brand_prefix: marketData.brand_prefix || "JobBridge",
            is_live: marketData.is_live,
          };
        }
      }
    }
  } catch (error) {
    console.error("Failed to load market data in layout:", error);
  }

  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${fontSans.variable} min-h-screen bg-background antialiased selection:bg-blue-500/30`}>
        <ThemeProvider defaultTheme="dark" enableSystem={false} storageKey="jobbridge-theme">
          <MarketProvider defaultMarket={defaultMarket}>
            <TestModeBanner />
            {children}
          </MarketProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
