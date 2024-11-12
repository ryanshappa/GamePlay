import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '~/server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  const postId = req.query.id as string; // Ensure postId is a string

  if (!postId) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }

  if (req.method === 'GET') {
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
          id: comment.userId,
          username: comment.user.username,
          avatarUrl: comment.user.avatarUrl,
        },
      }));

      return res.status(200).json(serializedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ message: 'Content is required and must be a string.' });
    }

    try {
      const newComment = await db.comment.create({
        data: {
          content,
          userId,
          postId,
        },
        include: {
          user: true,
        },
      });

      const serializedComment = {
        id: newComment.id,
        content: newComment.content,
        createdAt: newComment.createdAt.toISOString(),
        user: {
          id: newComment.userId,
          username: newComment.user.username,
          avatarUrl: newComment.user.avatarUrl,
        },
      };

      return res.status(201).json(serializedComment);
    } catch (error) {
      console.error('Error adding comment:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { commentId } = req.body;

    const numericCommentId = Number(commentId);

    if (!numericCommentId || isNaN(numericCommentId)) {
      return res.status(400).json({ message: 'commentId is required and must be a valid number.' });
    }

    try {
      const comment = await db.comment.findUnique({
        where: { id: numericCommentId },
        include: {
          user: true,
          post: {
            include: {
              author: true,
            },
          },
        },
      });

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      if (comment.postId !== postId) {
        return res.status(400).json({ error: 'Comment does not belong to the specified post' });
      }

      if (comment.userId !== userId && comment.post.authorId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await db.comment.delete({
        where: { id: numericCommentId },
      });

      return res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Error deleting comment:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).json({ message: `Method '${req.method}' Not Allowed` });
}
