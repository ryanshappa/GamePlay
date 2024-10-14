import type { NextApiRequest, NextApiResponse } from 'next';
import { clerkClient, getAuth } from '@clerk/nextjs/server';
import { db } from '~/server/db';
import { usersIndex } from '~/server/algoliaClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'DELETE') {
    try {


      // Delete the user from the database
      const deletedUser = await db.user.delete({ where: { id: userId } });

      // Remove the user from Algolia index
      await usersIndex.deleteObject(userId);

      // Delete the user from Clerk
      await clerkClient.users.deleteUser(userId);

      res.status(200).json({ message: 'Account deleted successfully.' });
    } catch (error: any) {
      console.error('Error deleting account:', error.message || error);
      
      // Enhanced error handling based on error types
      if (error.code === 'P2025') { // Example: Prisma's "Record to delete does not exist."
        return res.status(404).json({ error: 'User not found.' });
      }

      res.status(500).json({ error: 'Internal server error.' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  }
}