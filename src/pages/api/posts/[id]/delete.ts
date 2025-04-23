import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '~/server/db';
import { postsIndex } from '~/server/algoliaClient';
import { s3Client } from '~/utils/aws';
import {
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  const postId = req.query.id as string;

  if (!postId) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }

  if (req.method === 'DELETE') {
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const post = await db.post.findUnique({
        where: { id: postId },
      });

      if (!post || post.authorId !== userId) {
        return res.status(403).json({ error: 'You do not have permission to delete this post.' });
      }

      // 1. Gather comment IDs
      const comments = await db.comment.findMany({
        where: { postId },
        select: { id: true },
      });
      const commentIds = comments.map((c) => c.id);

      // 2. Delete all comment-likes
      if (commentIds.length) {
        await db.commentLike.deleteMany({
          where: { commentId: { in: commentIds } },
        });
      }

      // 3. Delete all comments
      await db.comment.deleteMany({ where: { postId } });

      // 4. Delete post-level likes & saved
      await db.like.deleteMany({ where: { postId } });
      await db.savedPost.deleteMany({ where: { postId } });

      // 5. Delete S3 files (source zip + unpacked)
      if (process.env.AWS_S3_SOURCE_BUCKET_NAME) {
        await deleteS3Prefix(process.env.AWS_S3_SOURCE_BUCKET_NAME, `uploads/${postId}/`);
      }
      if (process.env.AWS_S3_DESTINATION_BUCKET_NAME) {
        await deleteS3Prefix(process.env.AWS_S3_DESTINATION_BUCKET_NAME, `${postId}/`);
      }

      // 6. Delete the post row
      await db.post.delete({ where: { id: postId } });

      // 7. Remove from Algolia
      await postsIndex.deleteObject(postId);

      res.status(200).json({ message: 'Post deleted successfully.' });
    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  }
}

async function deleteS3Prefix(bucket: string, prefix: string) {
  try {
    const listed = await s3Client.send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix })
    );
    
    if (!listed.Contents?.length) return;
    
    await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: listed.Contents.map((o) => ({ Key: o.Key! })),
        },
      })
    );
  } catch (error) {
    console.error(`Error deleting S3 objects from ${bucket}/${prefix}:`, error);
    // Continue with other deletions even if S3 deletion fails
  }
}
