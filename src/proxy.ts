import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export default async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // keep request cookies in sync
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          // write cookies to browser
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Forces Supabase to refresh / hydrate the session
  await supabase.auth.getUser();

  return response;
}

/**
 * Run on all routes except static assets
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};