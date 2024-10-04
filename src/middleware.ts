import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default clerkMiddleware((auth, request, event) => {
  const { pathname } = request.nextUrl;

  // Define routes that don't require authentication
  const publicRoutes = ['/sign-in', '/sign-up', '/api', '/_next'];

  // Allow public routes to pass through
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // For all other routes, require authentication
  return NextResponse.next(); // Clerk's middleware handles authentication
});

export const config = {
  matcher: '/((?!sign-in|sign-up|api|_next).*)',
};