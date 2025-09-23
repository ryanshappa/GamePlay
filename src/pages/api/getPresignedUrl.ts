import { getAuth } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { s3Client } from "~/utils/aws";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { db } from '~/server/db';
import { ensureUserExists } from '~/utils/userUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { fileName, title, content, engine } = req.body;

  if (!fileName || !title || !engine) {
    return res.status(400).json({ message: "File name, title, and engine are required" });
  }

  try {
    const postId = uuidv4(); // Unique ID for the game and post
    const fileKey = `uploads/${postId}/${fileName}`; // Key where the uploaded file will be stored

    // Ensure the user exists
    await ensureUserExists(userId);

    await db.post.create({
      data: {
        id: postId,
        title,
        content: content || '',
        authorId: userId,
        fileUrl: '', 
        engine,
        status: 'processing',
      },
    });

    const params = {
      Bucket: process.env.AWS_S3_SOURCE_BUCKET_NAME!,
      Key: fileKey,
      ContentType: "application/zip",
      Metadata: {
        postId: postId,
        userid: userId,
        engine,
      },
    };

    const command = new PutObjectCommand(params);
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); 

    return res.status(200).json({ presignedUrl, fileKey, postId });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return res.status(500).json({ message: "Failed to generate presigned URL" });
  }
}
