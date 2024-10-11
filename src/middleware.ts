// middleware.ts

import { clerkMiddleware, clerkClient, getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Remove the import of 'db' and any database operations
// import { db } from './server/db';

export default clerkMiddleware((request: any) => { // Use 'any' if type is unknown
  console.log('Middleware executed for:', request.nextUrl.pathname);
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/sign-in', '/sign-up', '/_next'];

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // The 'getAuth' function can be used to retrieve user information
  const { userId } = getAuth(request);

  // Remove any database operations here
  // Middleware should be stateless and not depend on external data sources

  return NextResponse.next();
});

export const config = {
  matcher: ['/', '/api/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
