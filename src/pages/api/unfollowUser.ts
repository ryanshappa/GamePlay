import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '~/server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  const { userId } = getAuth(req);
  const { followingId } = req.body;

  if (!userId || !followingId) {
    return res.status(400).json({ message: 'Missing userId or followingId' });
  }

  try {
    const followToDelete = await db.follow.findFirst({
      where: {
        followerId: userId,
        followingId,
      },
    });

    if (!followToDelete) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    await db.follow.delete({
      where: {
        id: followToDelete.id,
      },
    });

    res.status(200).json({ message: 'Unfollowed user successfully' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}