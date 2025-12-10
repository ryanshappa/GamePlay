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
    const { username, displayName, bio, avatarUrl, websiteUrl, discordUrl, steamUrl, itchioUrl, youtubeUrl } = req.body;

    // Validate string fields
    const stringFields = { username, displayName, bio, avatarUrl, websiteUrl, discordUrl, steamUrl, itchioUrl, youtubeUrl };
    for (const [key, value] of Object.entries(stringFields)) {
      if (value !== undefined && value !== null && value !== '' && typeof value !== 'string') {
        return res.status(400).json({ error: `Invalid input data for ${key}` });
      }
    }

    try {
      const user = await db.user.update({
        where: { id: userId },
        data: {
          ...(username && { username: username as string }),
          ...(displayName !== undefined && { displayName: displayName || null }),
          ...(bio !== undefined && { bio: bio as string }),
          ...(avatarUrl && { avatarUrl: avatarUrl as string }),
          ...(websiteUrl !== undefined && { websiteUrl: websiteUrl || null }),
          ...(discordUrl !== undefined && { discordUrl: discordUrl || null }),
          ...(steamUrl !== undefined && { steamUrl: steamUrl || null }),
          ...(itchioUrl !== undefined && { itchioUrl: itchioUrl || null }),
          ...(youtubeUrl !== undefined && { youtubeUrl: youtubeUrl || null }),
        },
      });

      await usersIndex.saveObject({
        objectID: userId,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
      });

      res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating user profile:', errorMessage);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
