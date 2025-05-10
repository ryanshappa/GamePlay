import { getAuth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(200).json({ user: null }); // not logged in
  }
  
  try {
    // Fetch full user details from Clerk
    // clerkClient is already a configured client, no need to await
    const clerkUser = await clerkClient.users.getUser(userId);
    
    // Map Clerk user to our application's user format
    const user = {
      id: clerkUser.id,
      username: clerkUser.username,
      imageUrl: clerkUser.imageUrl,
      publicMetadata: clerkUser.publicMetadata,
      // Add any other properties you need
    };
    
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Failed to fetch user data' });
  }
}
