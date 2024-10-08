import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default clerkMiddleware((auth, request, event) => {
  const { pathname } = request.nextUrl;

  // Define routes that don't require authentication
  const publicRoutes = ['/sign-in', '/sign-up', '/api', '/_next'];


  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }


  return NextResponse.next(); 
});

export const config = {
  matcher: '/((?!sign-in|sign-up|api|_next).*)',
};