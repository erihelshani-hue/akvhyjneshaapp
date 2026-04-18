import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/login", "/auth/callback", "/offline"];
const LEGACY_LOCALE_PREFIXES = ["/de", "/sq", "/al"];

function isPublicPath(pathname: string): boolean {
  for (const publicPath of PUBLIC_PATHS) {
    if (pathname === publicPath || pathname.startsWith(`${publicPath}/`)) {
      return true;
    }
  }

  return pathname.startsWith("/auth/") || pathname === "/offline";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const legacyLocalePrefix = LEGACY_LOCALE_PREFIXES.find(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (legacyLocalePrefix) {
    const normalizedPath = pathname.slice(legacyLocalePrefix.length) || "/";
    const redirectUrl = new URL(normalizedPath, request.url);
    redirectUrl.search = request.nextUrl.search;
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname === "/auth/login") {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.search = request.nextUrl.search;
    return NextResponse.redirect(redirectUrl);
  }

  if (!isPublicPath(pathname)) {
    const { response, user } = await updateSession(request);

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
  }

  if (PUBLIC_PATHS.some((p) => pathname.includes(p) && p === "/login")) {
    const { user } = await updateSession(request);
    if (user) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|workbox-*.js).*)",
  ],
};
