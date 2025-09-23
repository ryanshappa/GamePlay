import { getAuth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(200).json({ user: null }); // not logged in
  }
  
  try {
    const clerkUser = await clerkClient.users.getUser(userId);
    
    const user = {
      id: clerkUser.id,
      username: clerkUser.username,
      imageUrl: clerkUser.imageUrl,
      publicMetadata: clerkUser.publicMetadata,
    };
    
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Failed to fetch user data' });
  }
}
