// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the route prefixes where we need cross-origin isolation.
const isolatedPaths = ['/api/proxy/', '/post/']; // Adjust this list as needed.

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // If the pathname begins with any isolated prefix, add the headers.
  const requiresIsolation = isolatedPaths.some((prefix) => pathname.startsWith(prefix));
  
  if (requiresIsolation) {
    const res = NextResponse.next();
    res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    res.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
    res.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
    return res;
  }
  
  // Otherwise, do nothing.
  return NextResponse.next();
}

export const config = {
  // Apply the middleware only to the isolated routes.
  matcher: ['/api/proxy/:path*', '/post/:path*'],
};
