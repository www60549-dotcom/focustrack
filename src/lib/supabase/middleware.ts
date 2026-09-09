import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
    const path = request.nextUrl.pathname;
    const isProtected =
      path.startsWith("/dashboard") ||
      path.startsWith("/tasks") ||
      path.startsWith("/habits") ||
      path.startsWith("/focus") ||
      path.startsWith("/calendar") ||
      path.startsWith("/goals") ||
      path.startsWith("/notes") ||
      path.startsWith("/analytics") ||
      path.startsWith("/settings") ||
      path.startsWith("/my-day") ||
      path.startsWith("/assistant");
    if (isProtected) {
      const login = request.nextUrl.clone();
      login.pathname = "/login";
      return NextResponse.redirect(login);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup") ||
    request.nextUrl.pathname.startsWith("/reset-password");

  const isProtected =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/tasks") ||
    request.nextUrl.pathname.startsWith("/habits") ||
    request.nextUrl.pathname.startsWith("/focus") ||
    request.nextUrl.pathname.startsWith("/calendar") ||
    request.nextUrl.pathname.startsWith("/goals") ||
    request.nextUrl.pathname.startsWith("/notes") ||
    request.nextUrl.pathname.startsWith("/analytics") ||
    request.nextUrl.pathname.startsWith("/settings") ||
    request.nextUrl.pathname.startsWith("/my-day") ||
    request.nextUrl.pathname.startsWith("/assistant");

  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
