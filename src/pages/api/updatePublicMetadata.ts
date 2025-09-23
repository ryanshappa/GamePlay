import { clerkClient } from '@clerk/nextjs/server'
import { NextApiRequest, NextApiResponse } from 'next'
import { getAuth } from '@clerk/nextjs/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  const { userId, bio } = req.body

  const { userId: authUserId } = getAuth(req)

  if (!authUserId || authUserId !== userId) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  if (typeof bio !== 'string') {
    return res.status(400).json({ error: 'Invalid bio.' })
  }

  try {
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        bio,
      },
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error updating publicMetadata:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}