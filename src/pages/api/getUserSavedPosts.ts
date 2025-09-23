import { db } from '~/server/db';
import { getAuth } from '@clerk/nextjs/server';
import { NextApiResponse } from 'next';
import { NextApiRequest } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  if (!userId) {
    console.error('Unauthorized access attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const saved = await db.savedPost.findMany({
      where: { userId },
      include: { post: true }, 
    });
    res.status(200).json(saved);
  } catch (err) {
    console.error('Error fetching saved posts:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
