// src/pages/api/getPost.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid post ID" });
  }

  try {
    const post = await db.post.findUnique({
      where: { id: id }, 
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
