// src/pages/api/upload-file.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { ourFileRouter } from '~/api/uploadthing/core'; // Adjust path if needed

// Extend NextApiRequest to include files
interface ExtendedNextApiRequest extends NextApiRequest {
  files: any; // Adjust type as necessary
}

export default async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const result = await (ourFileRouter.gameUploader as any).uploadFiles(req.files); // Type assertion to bypass type check
      res.status(200).json({ fileUrl: result.fileUrl });
    } catch (error: any) { // Assert error type
      res.status(500).json({ error: 'File upload failed', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
