import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_PATHS = [
  "/api",
  "/_next",
  "/login",
  "/convite",
  "/solicitar-acesso",
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return true;
  if (/\.(png|jpg|svg|webp|ico|json|js)$/.test(pathname)) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  // No session → login
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check the membership cookie set by the layout
  // If it explicitly says "no", redirect to solicitar-acesso
  const membershipStatus = request.cookies.get("membership-status")?.value;
  if (membershipStatus === "none") {
    return NextResponse.redirect(new URL("/solicitar-acesso", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
