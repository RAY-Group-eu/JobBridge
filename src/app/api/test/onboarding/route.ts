import { NextResponse } from "next/server";
import { verifySignupCode } from "@/lib/verify";

export async function GET() {
  const mockClient = {
    auth: {
      async verifyOtp({ email, token }: { email: string; token: string; type: "signup" }) {
        if (email === "user@example.com" && token === "12345678") return { error: null } as const;
        return { error: { message: "invalid" } } as const;
      },
    },
  } as const;

  const cases = [
    { email: "user@example.com", token: "12345678", expectOk: true },
    { email: "user@example.com", token: "00000000", expectOk: false },
    { email: "user@example.com", token: "12A45678", expectOk: false },
  ];

  const results = [] as Array<{ ok: boolean; error?: string }>;
  for (const c of cases) {
    const r = await verifySignupCode(mockClient as any, c.email, c.token);
    results.push(r);
  }

  const pass = results[0].ok === true && results[1].ok === false && results[2].ok === false;
  return NextResponse.json({ pass, results });
}
