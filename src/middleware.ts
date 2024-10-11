import { clerkMiddleware, clerkClient, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from './server/db';

export default clerkMiddleware(async (auth, request, event) => {
  console.log('Middleware executed for:', request.nextUrl.pathname);
  const { pathname } = request.nextUrl;


  const publicRoutes = ['/sign-in', '/sign-up', '/api', '/_next'];

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const userId = (auth as any).user?.id; 

  if (userId) {
    // Check if user exists in database
    const userExists = await db.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      try {
        // Fetch user data from Clerk
        const clerkUser = await clerkClient.users.getUser(userId);

        // Create user in database
        await db.user.create({
          data: {
            id: userId,
            username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress || '',
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            avatarUrl: (clerkUser as any).profileImageUrl, 
            bio: (clerkUser.publicMetadata?.bio as string) || '',
          },
        });
      } catch (error) {
        console.error('Error creating user in database:', error);
      }
    }
  }

  return NextResponse.next(); 
});

export const config = {
  matcher: ['/', '/api/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
};