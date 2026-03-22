import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@openpolis/i18n/routing";
import { getOperatorSessionRedirectPath } from "@/lib/operator-route-guard";
import { applySecurityHeaders } from "@/lib/security/headers";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const redirectPath = getOperatorSessionRedirectPath({
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
    cookieNames: request.cookies.getAll().map((cookie) => cookie.name)
  });

  if (redirectPath) {
    const response = NextResponse.redirect(new URL(redirectPath, request.url));

    applySecurityHeaders(response.headers, {
      isDevelopment: process.env.NODE_ENV !== "production"
    });

    return response;
  }

  const response = intlMiddleware(request);

  applySecurityHeaders(response.headers, {
    isDevelopment: process.env.NODE_ENV !== "production"
  });

  return response;
}

export const config = {
  matcher: ["/", "/(en|zh-CN)/:path*"]
};
