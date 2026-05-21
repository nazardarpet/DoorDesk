import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  const isLoggedIn = Boolean(
    req.cookies.get("authjs.session-token") ?? req.cookies.get("__Secure-authjs.session-token")
  );
  const { pathname } = req.nextUrl;

  if (pathname === "/login" && isLoggedIn) {
    return Response.redirect(new URL("/", req.nextUrl));
  }

  if (!isLoggedIn && pathname !== "/login") {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return Response.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/).*)"]
};
