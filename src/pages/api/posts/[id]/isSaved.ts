import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '~/server/db';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const postId = req.query.id as string;
  const { userId } = getAuth(req);

  if (!postId || !userId) {
    return res.status(400).json({ error: 'Invalid post ID or user not signed in.' });
  }

  try {
    const savedRecord = await db.savedPost.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    res.status(200).json({ saved: !!savedRecord });
  } catch (error) {
    console.error("Error checking save status:", error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}
