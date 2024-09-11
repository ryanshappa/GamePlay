import { auth } from "@clerk/nextjs/server"; 
import { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db"; // Prisma db connection

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure the method is POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Fetch user from Clerk's server-side `auth`
  const { userId } = auth(); // Correctly fetch userId from Clerk

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { title, fileUrl, content } = req.body;

  try {
    // Insert post into database using Prisma
    const post = await db.post.create({
      data: {
        title,
        fileUrl,
        content, 
        authorId: userId, // Associate post with the authenticated user
      },
    });

    // Send back the created post as a response
    return res.status(201).json(post);
  } catch (error) {
    console.error("Error saving post:", error);
    return res.status(500).json({ message: "Failed to save post", error });
  }
}
