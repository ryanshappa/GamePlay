import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '~/server/db';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const commentId = Number(req.query.commentId || req.query.id);
  const { userId } = getAuth(req);

  if (!commentId) {
    return res.status(400).json({ error: 'Invalid comment ID' });
  }
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const existingLike = await db.commentLike.findUnique({
        where: { userId_commentId: { userId, commentId } },
      });
      if (existingLike) {
        return res.status(400).json({ error: 'Already liked' });
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
    try {
      await db.commentLike.delete({
        where: { userId_commentId: { userId, commentId } },
      });
      return res.status(200).json({ message: 'Comment unliked successfully' });
    } catch (error: any) {
      // If using Prisma, error.code "P2025" means no record was found.
      if (error.code === 'P2025') {
        return res.status(200).json({ message: 'Comment unliked successfully' });
      }
      console.error('Error unliking comment:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
