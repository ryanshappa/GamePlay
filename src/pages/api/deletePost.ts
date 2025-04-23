// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getAuth } from "@clerk/nextjs/server";
// import { db } from '~/server/db';
// import { s3Client } from '~/utils/aws';
// import {
//   ListObjectsV2Command,
//   DeleteObjectsCommand,
// } from '@aws-sdk/client-s3';
// import algoliasearch from 'algoliasearch';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { userId } = getAuth(req);

//   if (!userId) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   const { postId } = req.body;

//   if (!postId) {
//     return res.status(400).json({ message: "Post ID is required" });
//   }

//   try {
//     // Fetch the post
//     const post = await db.post.findUnique({
//       where: { id: postId },
//     });

//     if (!post) {
//       return res.status(404).json({ message: "Post not found" });
//     }

//     if (post.authorId !== userId) {
//       return res.status(403).json({ message: "Forbidden" });
//     }

//     // Delete game files from S3
//     await deleteGameFiles(postId);

//     // Delete related records in the correct order to respect foreign key constraints
//     // 1. First delete all comment likes for comments on this post
//     await db.commentLike.deleteMany({
//       where: {
//         comment: {
//           postId: postId
//         }
//       }
//     });

//     // 2. Then delete all comments on this post
//     await db.comment.deleteMany({
//       where: { postId: postId }
//     });

//     // 3. Delete post likes
//     await db.like.deleteMany({
//       where: { postId: postId }
//     });

//     // 4. Delete saved posts
//     await db.savedPost.deleteMany({
//       where: { postId: postId }
//     });

//     // 5. Finally delete the post itself
//     await db.post.delete({
//       where: { id: postId },
//     });

//     // Remove from Algolia
//     const client = algoliasearch(process.env.ALGOLIA_APP_ID!, process.env.ALGOLIA_WRITE_API_KEY!);
//     const index = client.initIndex('posts');
//     await index.deleteObject(postId);

//     return res.status(200).json({ message: "Post deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting post:", error);
//     return res.status(500).json({ message: "Failed to delete post" });
//   }
// }

// async function deleteGameFiles(gameId: string) {
//   // These env vars must exist (set them in .env or Vercel)
//   const sourceBucket = process.env.AWS_S3_SOURCE_BUCKET_NAME!;
//   const destinationBucket = process.env.AWS_S3_DESTINATION_BUCKET_NAME!;

//   // 1) Delete all extracted files under `${gameId}/` in the destination bucket
//   await deleteObjectsWithPrefix(destinationBucket, `${gameId}/`);

//   // 2) Delete the original zip under `uploads/${gameId}/` in the source bucket
//   await deleteObjectsWithPrefix(sourceBucket, `uploads/${gameId}/`);
// }

// async function deleteObjectsWithPrefix(bucketName: string, prefix: string) {
//   // List all objects under the prefix
//   const listParams = {
//     Bucket: bucketName,
//     Prefix: prefix,
//   };

//   const listedObjects = await s3Client.send(new ListObjectsV2Command(listParams));

//   if (listedObjects.Contents && listedObjects.Contents.length > 0) {
//     const deleteParams = {
//       Bucket: bucketName,
//       Delete: { 
//         Objects: listedObjects.Contents.map(({ Key }) => ({ Key: Key! }))
//       },
//     };

//     await s3Client.send(new DeleteObjectsCommand(deleteParams));
//   }
// }
