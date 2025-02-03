import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '~/server/db';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const postId = req.query.id as string;
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!postId) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }

  if (req.method === 'POST') {
    // "Save" the post
    try {
      // Check if already saved
      const existing = await db.savedPost.findUnique({
        where: {
          userId_postId: { userId, postId },
        },
      });
      if (existing) {
        return res.status(400).json({ error: 'Already saved' });
      }

      await db.savedPost.create({
        data: { userId, postId },
      });

      return res.status(200).json({ message: 'Post saved' });
    } catch (err) {
      console.error('Error saving post:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    // "Unsave" the post
    try {
      await db.savedPost.delete({
        where: {
          userId_postId: { userId, postId },
        },
      });
      return res.status(200).json({ message: 'Post unsaved' });
    } catch (err) {
      console.error('Error unsaving post:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
