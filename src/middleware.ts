import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default clerkMiddleware((auth, req: NextRequest) => {
  console.log('Middleware executed for:', req.nextUrl.pathname);

  const { pathname } = req.nextUrl;

  const publicRoutes = [
    '/sign-in', 
    '/sign-up', 
    '/_next',
    '/api/updatePost',
    '/api/updatePostStatus'
  ];

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // You can use `auth` here to access authentication details
  const { userId } = auth();
  
  // If the user is not authenticated, redirect to sign-in
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }


  return NextResponse.next();
});

export const config = {
  matcher: [
    '/',
    '/((?!api/getPresignedUrl).*)',
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};