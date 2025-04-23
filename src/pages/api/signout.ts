import { getAuth } from '@clerk/nextjs/server';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Clear any server-side session data if needed
    
    // Return success
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error signing out:', error);
    return res.status(500).json({ error: 'Failed to sign out' });
  }
} 