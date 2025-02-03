import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '~/server/db';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const commentId = Number(req.query.commentId);
  const { userId } = getAuth(req);

  if (!commentId || !userId) {
    return res.status(400).json({ error: 'Invalid comment ID or user not signed in.' });
  }

  try {
    const likeCount = await db.commentLike.count({
      where: { commentId },
    });
    const currentUserLike = await db.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });

    return res.status(200).json({
      liked: !!currentUserLike,
      likeCount,
    });
  } catch (error) {
    console.error('Error checking comment like status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
