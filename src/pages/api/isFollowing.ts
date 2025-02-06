import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '~/server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  const targetUserId = req.query.userId;

  if (!userId || !targetUserId || typeof targetUserId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid userId' });
  }

  try {
    const follow = await db.follow.findFirst({
      where: {
        followerId: userId,
        followingId: targetUserId,
      },
    });
    return res.status(200).json({ isFollowing: !!follow });
  } catch (error) {
    console.error('Error checking following status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
