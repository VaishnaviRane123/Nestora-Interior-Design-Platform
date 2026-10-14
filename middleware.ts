// middleware.ts
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

// Build an edge-safe auth wrapper from the config only.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const role = session?.user?.role;
  const isLoggedIn = !!session;

  const path = nextUrl.pathname;

  const isAdminRoute = path.startsWith('/admin');
  const isDashboardRoute = path.startsWith('/dashboard');
  const isDesignerDashboard = path.startsWith('/designer/dashboard');
  const isBoardsRoute = path.startsWith('/boards');
  const isDesignerRegister = path.startsWith('/designer/register');
  const isLoginPage = path === '/login';

  // Already logged in? Bounce away from /login
  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  // Admin-only
  if (isAdminRoute && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // Customer dashboards and boards require a signed-in account.
  if ((isDashboardRoute || isBoardsRoute || isDesignerDashboard) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  if (isDesignerDashboard && role !== 'DESIGNER') {
    return NextResponse.redirect(new URL('/designer/register', nextUrl));
  }

  // Designer registration requires a signed-in account. Applicants can apply
  // from their customer account; the API creates a pending application.
  if (isDesignerRegister && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(path + nextUrl.search);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/boards/:path*',
    '/designer/dashboard/:path*',
    '/admin/:path*',
    '/designer/register/:path*',
    '/login',
  ],
};
