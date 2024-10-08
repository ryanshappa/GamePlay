import nextConnect from 'next-connect'; 
import multer from 'multer';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { s3Client } from '~/utils/aws';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { db } from '~/server/db';

// Extend NextApiRequest to include file property
interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
}

const upload = multer({
  storage: multer.memoryStorage(),
});

const apiRoute = nextConnect<NextApiRequestWithFile, NextApiResponse>({
  onError(error: unknown, req: NextApiRequestWithFile, res: NextApiResponse) { 
    res.status(500).json({ error: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}` });
  },
  onNoMatch(req: NextApiRequestWithFile, res: NextApiResponse) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(upload.single('file'));

apiRoute.post(async (req: NextApiRequestWithFile, res: NextApiResponse) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const fileName = `avatars/${userId}/${file.originalname}`;
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read' as const,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));

    const avatarUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;

    // Update user's avatar URL in the database
    await db.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    res.status(200).json({ avatarUrl });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: 'Failed to upload avatar' });
  }
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
