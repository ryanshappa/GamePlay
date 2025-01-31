import { db } from '~/server/db';
import { getAuth } from '@clerk/nextjs/server';
import type { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  const commentId = Number(req.query.commentId);

  if (!userId) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }
  if (!commentId || isNaN(commentId)) {
    return res.status(400).json({ error: 'Invalid commentId' });
  }

  if (req.method === 'POST') {
    // Like a comment
    try {
      // Check if already liked
      const existing = await db.commentLike.findUnique({
        where: {
          userId_commentId: {
            userId,
            commentId,
          },
        },
      });
      if (existing) {
        return res.status(400).json({ error: 'You have already liked this comment' });
      }
      await db.commentLike.create({
        data: { userId, commentId },
      });
      return res.status(200).json({ message: 'Comment liked successfully' });
    } catch (error) {
      console.error('Error liking comment:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    // Unlike a comment
    try {
      await db.commentLike.delete({
        where: {
          userId_commentId: { userId, commentId },
        },
      });
      return res.status(200).json({ message: 'Comment unliked successfully' });
    } catch (error) {
      console.error('Error unliking comment:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
} 