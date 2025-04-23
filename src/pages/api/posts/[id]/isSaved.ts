import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '~/server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const postId = req.query.id as string;

  try {
    const savedPost = await db.savedPost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    return res.status(200).json({ saved: !!savedPost });
  } catch (error) {
    console.error('Error checking saved status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
