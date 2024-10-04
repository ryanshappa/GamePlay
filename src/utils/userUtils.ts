import { clerkClient } from '@clerk/nextjs/server';
import { db } from '~/server/db';

export async function ensureUserExists(userId: string) {
  const user = await clerkClient.users.getUser(userId);

  const existingUser = await db.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    const username = user.username ?? '';
    const email = user.emailAddresses[0]?.emailAddress ?? '';

    await db.user.create({
      data: {
        id: userId,
        username,
        email,
      },
    });
  }
}
