import { getAuth } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db";
import { ensureUserExists } from "~/utils/userUtils";
import { uploadGameToS3 } from "~/server/uploadGame";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, 
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only accept POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Get authenticated user
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  await ensureUserExists(userId);

  // Parse form data
  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form data:", err);
      return res.status(500).json({ message: "Error parsing form data" });
    }

    const { title, content } = fields;
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!title || !file) {
      return res.status(400).json({ message: "Missing title or file" });
    }

    try {
      // Read the uploaded file
      const filePath = file.filepath;
      const fileBuffer = fs.readFileSync(filePath);

      // Upload game files to S3 and get the game URL
      const gameUrl = await uploadGameToS3(fileBuffer);

      // Insert post into database using Prisma
      const post = await db.post.create({
        data: {
          title: String(Array.isArray(title) ? title[0] : title),
          fileUrl: gameUrl, // Store the S3 URL to the game's index.html
          content: String(Array.isArray(content) ? content[0] : content || ""),
          authorId: userId,
        },
      });

      return res.status(201).json(post);
    } catch (error) {
      console.error("Error saving post:", error);
      return res.status(500).json({ message: "Failed to save post", error });
    }
  });
}
