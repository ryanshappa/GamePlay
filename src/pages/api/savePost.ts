import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db";
import { ensureUserExists } from "~/utils/userUtils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  await ensureUserExists(userId);

  const { title, fileKey, content } = req.body;

  try {
    // Construct the URL to the game's index.html
    const gameUrl = `/games/${fileKey}/index.html`;

    // Insert post into database using Prisma
    const post = await db.post.create({
      data: {
        title,
        fileUrl: gameUrl, // Store the URL to the game's index.html
        content,
        authorId: userId,
      },
    });

    return res.status(201).json(post);
  } catch (error) {
    console.error("Error saving post:", error);
    return res.status(500).json({ message: "Failed to save post", error });
  }
}
