import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { authRateLimit, generalApiRateLimit } from "@/lib/rate-limit";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = token?.role === "admin";
    const isTecnico = token?.role === "tecnico";

    // Apply rate limiting for authentication endpoints
    if (req.nextUrl.pathname.startsWith("/api/auth/")) {
      // More aggressive rate limiting for sign-in attempts
      if (req.nextUrl.pathname.includes("signin") ||
          (req.method === "POST" && req.nextUrl.pathname === "/api/auth/callback/credentials")) {
        const rateLimitResult = authRateLimit(req);
        if (!rateLimitResult.success) {
          return rateLimitResult.error;
        }
      } else {
        // General rate limiting for other auth endpoints
        const rateLimitResult = generalApiRateLimit(req);
        if (!rateLimitResult.success) {
          return rateLimitResult.error;
        }
      }
    }

    // Rutas que están en el grupo (dashboard) pero no tienen /dashboard en la URL
    const dashboardRoutes = [
      "/ubicaciones",
      "/componentes",
      "/equipos",
      "/repuestos",
      "/reportes"
    ];

    // Permitir acceso a rutas de dashboard para técnicos y admin
    const isDashboardRoute = req.nextUrl.pathname.startsWith("/dashboard") ||
                             dashboardRoutes.some(route => req.nextUrl.pathname.startsWith(route));

    if (isDashboardRoute) {
      if (!isAdmin && !isTecnico) {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
    }

    // Rutas de admin solo para admin
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    const response = NextResponse.next();

    // Add rate limit headers if applicable
    // Note: Next.js middleware doesn't easily allow custom headers on redirects,
    // so the main rate limiting headers are added in the API routes themselves

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Rutas públicas que no requieren autenticación
        const publicPaths = [
          "/auth/signin",
          "/auth/error",
          "/api/auth",
          "/_next",
          "/favicon.ico",
          "/api/auth/providers",
          "/api/auth/csrf",
          "/api/auth/session",
        ];

        const isPublicPath = publicPaths.some((path) =>
          req.nextUrl.pathname.startsWith(path)
        );

        if (isPublicPath) {
          return true;
        }

        // Requerir token para todas las demás rutas
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};