import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '~/server/db';
import { postsIndex } from '~/server/algoliaClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { gameId, gameUrl, status } = req.body;

  if (!gameId || !gameUrl || !status) {
    return res.status(400).json({ message: 'gameId, gameUrl, and status are required' });
  }

  try {
    const post = await db.post.update({
      where: { id: gameId },
      data: { fileUrl: gameUrl, status },
    });

    if (status === 'valid') {
      await postsIndex.saveObject({
        objectID: post.id,
        title: post.title,
        content: post.content,
        authorId: post.authorId,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      });
    }

    return res.status(200).json({ message: 'Post updated and indexed successfully' });
  } catch (error) {
    console.error('Error updating post:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
