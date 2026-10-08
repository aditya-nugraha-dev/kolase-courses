// KOLASE — Proxy (pengganti middleware.ts di Next.js 16).
// Tugas: (1) header keamanan di semua respons, (2) RBAC kasar berbasis cookie
// session. Verifikasi kriptografis penuh dilakukan di API route & server layout.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseUnverified } from "./lib/session-edge";
import { ADMIN_ROLES_EDGE, STUDENT_AREA_ROLES_EDGE } from "./lib/session-edge";

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https:",
  "frame-src https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

export function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Content-Security-Policy", CSP);
  res.headers.set("Permissions-Policy", "camera=(), microphone=(self), geolocation=()");
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  return res;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("kolase_session")?.value ?? null;
  const parsed = session ? parseUnverified(session) : {};

  // RBAC kasar (verifikasi HMAC penuh di server):
  // /student/* -> student + admin penuh ; /admin|guru/* -> admin penuh
  // /chat|/profil/* -> semua peran yang login.
  if (pathname.startsWith("/student")) {
    if (!session || !STUDENT_AREA_ROLES_EDGE.includes(parsed.role ?? "")) {
      const url = new URL("/masuk", request.url);
      url.searchParams.set("next", pathname);
      url.searchParams.set("need", "student");
      const res = NextResponse.redirect(url);
      return applySecurityHeaders(res);
    }
  }
  if (pathname.startsWith("/chat") || pathname.startsWith("/profil")) {
    if (!session || !parsed.role) {
      const url = new URL("/masuk", request.url);
      url.searchParams.set("next", pathname);
      url.searchParams.set("need", "login");
      const res = NextResponse.redirect(url);
      return applySecurityHeaders(res);
    }
  }
  if (pathname.startsWith("/admin") || pathname.startsWith("/guru")) {
    if (!session || !ADMIN_ROLES_EDGE.includes(parsed.role ?? "")) {
      const url = new URL("/masuk", request.url);
      url.searchParams.set("next", pathname);
      url.searchParams.set("need", "admin");
      const res = NextResponse.redirect(url);
      return applySecurityHeaders(res);
    }
  }

  const res = NextResponse.next();
  return applySecurityHeaders(res);
}

export const config = {
  matcher: [
    "/student/:path*",
    "/admin/:path*",
    "/guru/:path*",
    "/chat/:path*",
    "/profil/:path*",
    "/daftar",
    "/masuk",
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|css|js|woff2?)$).*)",
  ],
};
