// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// We want to protect only certain routes that must be authed server-side.
// For everything else, we do a front-end check.
const protectedRoutes = [
  '/api/getPresignedUrl',   // or your route that actually requires user session
  // ...any other strictly server-protected endpoints...
];

export default clerkMiddleware((auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;
  const { userId } = auth();

  // If the route is not in protectedRoutes, allow access
  if (!protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // If it is in protectedRoutes but user is not signed in, redirect
  if (!userId) {
       return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
           status: 401,
           headers: { 'content-type': 'application/json' },
         });
  }

  return NextResponse.next();
});

export const config = {
  // We only run middleware on the routes we care about
  matcher: ['/api/getPresignedUrl', '/api/deleteAccount', '/sign-in(.*)', '/api/updateUserProfile', '/api/posts(.*)', '/api/comments(.*)', '/sign-up(.*)'],
};
