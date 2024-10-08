import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '~/server/db';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  const postId = parseInt(req.query.id as string);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const { content } = req.body;
    try {
      const comment = await db.comment.create({
        data: {
          content,
          userId,
          postId,
        },
        include: {
          user: true,
        },
      });
      res.status(200).json({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        user: {
          id: comment.user.id,
          username: comment.user.username,
          avatarUrl: comment.user.avatarUrl,
        },
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } 
  // Add GET request handling
  else if (req.method === 'GET') {
    try {
      const comments = await db.comment.findMany({
        where: { postId },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      const serializedComments = comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        user: {
          id: comment.user.id,
          username: comment.user.username,
          avatarUrl: comment.user.avatarUrl,
        },
      }));

      res.status(200).json(serializedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } 
  else {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  }
}
