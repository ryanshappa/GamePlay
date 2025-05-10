import { clerkClient } from '@clerk/clerk-sdk-node';
import { db } from '~/server/db';

export async function ensureUserExists(userId: string) {
  // clerkClient is already a configured client, no need to await
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
