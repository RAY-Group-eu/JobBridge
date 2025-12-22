import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { Database } from "@/lib/types";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Request cookies don't support maxAge/expires etc. in the same way response cookies do 
          // but we want to update the value so the client sees it for this request.
          request.cookies.set({
            name,
            value,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  // Refresh session/cookies on each request so SSR sees the latest auth state
  const { data: { session } } = await supabase.auth.getSession();

  const path = request.nextUrl.pathname;
  const isProtectedPath =
    path.startsWith("/admin") ||
    path.startsWith("/analytics") ||
    path.startsWith("/moderation");

  if (isProtectedPath) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Fetch user system roles
    const { data: rolesData } = await supabase
      .from("user_system_roles")
      .select("role:system_roles(name)")
      .eq("user_id", session.user.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRoles = (rolesData || []).map((r: any) => r.role?.name).filter(Boolean);

    let hasAccess = false;

    if (path.startsWith("/admin")) {
      hasAccess = userRoles.includes("admin");
    } else if (path.startsWith("/analytics")) {
      hasAccess = userRoles.includes("admin") || userRoles.includes("analyst");
    } else if (path.startsWith("/moderation")) {
      hasAccess = userRoles.includes("admin") || userRoles.includes("moderator");
    }

    if (!hasAccess) {
      return NextResponse.redirect(new URL("/app-home", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)"],
};
