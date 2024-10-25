import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '~/server/db';
import { postsIndex } from '~/server/algoliaClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { gameId, gameUrl, status } = req.body;

  if (!gameId || !status) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Update the post in the database
    const post = await db.post.update({
      where: { id: gameId },
      data: {
        fileUrl: gameUrl || '',
        status,
      },
    });

    if (status === 'valid') {
      // Index the new post in Algolia
      await postsIndex.saveObject({
        objectID: post.id,
        title: post.title,
        content: post.content,
        authorId: post.authorId,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        // Include other fields as necessary
      });
    }

    return res.status(200).json({ message: 'Post updated successfully' });
  } catch (error) {
    console.error('Error updating post:', error);
    return res.status(500).json({ message: 'Failed to update post' });
  }
}
