import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server"; // Fixed import type
import { Database } from "@/lib/types";

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    // Default redirect to /onboarding if 'next' is not provided
    const next = requestUrl.searchParams.get("next") ?? "/onboarding";

    if (code) {
        const cookieStore = request.cookies;
        const supabase = createServerClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        // Note: In a Route Handler, we use response.cookies.set or middleware. 
                        // However, createServerClient needs a 'set' method for the auth helper to work.
                        // With Next.js 15 App Router, we should be using the cookieStore from 'next/headers' if possible,
                        // but in a Route Handler passing 'request' cookies and setting 'response' cookies is the way.
                        // But we can't pass 'response' object into this closure easily before creating it.
                        // The standard Supabase pattern for Next.js Route Handlers:
                        // Create a temporary client to exchange code, then copy cookies to response.
                        // Ref: https://supabase.com/docs/guides/auth/server-side/nextjs
                    },
                    remove(name: string, options: CookieOptions) {
                    },
                },
            }
        );

        // Creates a new Response to hold cookies
        const response = NextResponse.redirect(new URL(next, requestUrl.origin));

        const supabaseResponse = createServerClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value;
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        response.cookies.set({
                            name,
                            value,
                            ...options,
                        });
                    },
                    remove(name: string, options: CookieOptions) {
                        response.cookies.set({
                            name,
                            value: "",
                            ...options,
                        });
                    },
                },
            }
        );

        const { error } = await supabaseResponse.auth.exchangeCodeForSession(code);

        if (!error) {
            return response;
        }
    }

    // If no code, or error, redirect to origin
    // We might want to redirect to an error page or back to onboarding with query param
    return NextResponse.redirect(new URL("/onboarding?error=auth_code_error", requestUrl.origin));
}
