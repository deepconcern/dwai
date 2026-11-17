import { NextRequest, NextResponse } from "next/server";

import { loginHref } from "@/lib/safeNext";

/** The API's session cookie (see dwai-api/internal/auth). */
const SESSION_COOKIE = "dwai_session";

/** Pages a logged-out visitor may see. */
const PUBLIC_PATHS = ["/login", "/register"];

/**
 * Sends logged-out visitors to the login page, returning to where they were
 * going afterwards. This is an optimistic check on the cookie's presence
 * only: the API decides whether the session is valid, and pages call
 * `requireUser` to handle one it rejects.
 */
export const proxy = (request: NextRequest) => {
  const { pathname, search } = request.nextUrl;

  if (PUBLIC_PATHS.includes(pathname) || request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(
    new URL(loginHref(pathname + search), request.url),
  );
};

export const config = {
  matcher: [
    // Everything except the API rewrite, Next.js internals, and static files.
    "/((?!graphql|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico)$).*)",
  ],
};
