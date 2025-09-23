import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '~/server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { gameId, status } = req.body;

  if (!gameId || !status) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await db.post.update({
      where: { id: gameId },
      data: {
        status,
      },
    });

    return res.status(200).json({ message: 'Post status updated successfully' });
  } catch (error) {
    console.error('Error updating post status:', error);
    return res.status(500).json({ message: 'Failed to update post status' });
  }
}
