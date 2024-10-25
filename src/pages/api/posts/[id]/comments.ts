import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '~/server/db';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const postId = parseInt(req.query.id as string);

  if (isNaN(postId)) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }

  if (req.method === 'GET') {
    // Fetch comments for the post
    try {
      const comments = await db.comment.findMany({
        where: { postId: postId.toString() },
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
          id: comment.userId,
          username: comment.user.username,
          avatarUrl: comment.user.avatarUrl,
        },
      }));

      res.status(200).json(serializedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    // Add a new comment to the post
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Invalid comment content' });
    }

    try {
      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const comment = await db.comment.create({
        data: {
          content,
          postId: postId.toString(),
          userId,
        },
        include: {
          user: true,
        },
      });

      const serializedComment = {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        user: {
          id: comment.userId,
          username: comment.user.username,
          avatarUrl: comment.user.avatarUrl,
        },
      };

      res.status(201).json(serializedComment);
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    // Delete a comment
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const commentId = parseInt(req.query.commentId as string);

    if (isNaN(commentId)) {
      return res.status(400).json({ error: 'Invalid comment ID' });
    }

    try {
      const comment = await db.comment.findUnique({
        where: { id: commentId },
        include: { user: true, post: true },
      });

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      const post = await db.post.findUnique({
        where: { id: comment.postId },
      });

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      if (comment.userId !== userId && post.authorId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await db.comment.delete({
        where: { id: commentId },
      });

      res.status(204).end();
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
