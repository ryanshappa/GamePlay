import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '~/server/db';
import { postsIndex } from '~/server/algoliaClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { postId, title, content } = req.body;

  if (!postId) {
    return res.status(400).json({ message: 'Post ID is required' });
  }

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'Title is required and cannot be empty' });
  }

  try {
    // Fetch the post to verify ownership
    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({ message: 'Forbidden: You can only edit your own posts' });
    }

    // Update the post
    const updatedPost = await db.post.update({
      where: { id: postId },
      data: {
        title: title.trim(),
        content: content?.trim() || '',
      },
    });

    // Update Algolia index
    try {
      await postsIndex.partialUpdateObject({
        objectID: postId,
        title: updatedPost.title,
        content: updatedPost.content,
        updatedAt: updatedPost.updatedAt.toISOString(),
      });
    } catch (algoliaError) {
      console.error('Error updating Algolia index:', algoliaError);
      // Don't fail the request if Algolia update fails
    }

    return res.status(200).json({
      message: 'Post updated successfully',
      post: {
        id: updatedPost.id,
        title: updatedPost.title,
        content: updatedPost.content,
      },
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return res.status(500).json({ message: 'Failed to update post' });
  }
}

