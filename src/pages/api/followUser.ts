// src/pages/api/followUser.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '~/server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { followingId } = req.body;

  if (!followingId) {
    return res.status(400).json({ message: 'Missing followingId' });
  }

  try {
    await db.follow.create({
      data: {
        followerId: String(userId),
        followingId: String(followingId),
      },
    });

    res.status(200).json({ message: 'Followed user successfully' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
