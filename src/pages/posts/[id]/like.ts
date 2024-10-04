import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '~/server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  const postId = parseInt(req.query.id as string);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      // Check if the user has already liked the post
      const existingLike = await db.like.findFirst({
        where: { userId, postId },
      });

      if (existingLike) {
        return res.status(400).json({ error: 'You have already liked this post.' });
      }

      await db.like.create({
        data: {
          userId,
          postId,
        },
      });
      res.status(200).json({ message: 'Post liked' });
    } catch (error) {
      console.error('Error liking post:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  }
}
