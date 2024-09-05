// src/pages/api/savePost.ts

import { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db"; // Assuming you're using Prisma

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = auth();

  if (!user.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { title, fileUrl, content } = req.body; 

  try {
    const post = await db.post.create({
      data: {
        title,
        fileUrl,
        content, // Include content here
        authorId: parseInt(user.userId, 10),
      },
    });

    return res.status(201).json(post);
  } catch (error) {
    return res.status(500).json({ message: "Failed to save post", error });
  }
}


