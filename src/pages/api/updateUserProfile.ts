import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '~/server/db';
import { usersIndex } from '~/server/algoliaClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const { username, bio, avatarUrl } = req.body;

    if (
      (username && typeof username !== 'string') ||
      (bio && typeof bio !== 'string') ||
      (avatarUrl && typeof avatarUrl !== 'string')
    ) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    try {
      const user = await db.user.update({
        where: { id: userId },
        data: {
          ...(username && { username }),
          ...(bio && { bio }),
          ...(avatarUrl && { avatarUrl }),
        },
      });

      // Update the user in Algolia index
      await usersIndex.saveObject({
        objectID: userId,
        username: user.username,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
      });

      res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error: any) {
      console.error('Error updating user profile:', error.message || error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
