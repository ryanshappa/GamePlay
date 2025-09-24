import { clerkClient } from '@clerk/nextjs/server';
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '~/server/db';
import { usersIndex } from '~/server/algoliaClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (typeof userId !== 'string') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    let user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        bio: true,
        avatarUrl: true,
        posts: true,
        followers: true,
        following: true,
        likes: {
          select: {
            post: true,
          },
        },
      },
    });

    if (!user) {
      // User not found in database, create user
      try {
        // Fetch user data from Clerk
        const clerk = await clerkClient();
        const clerkUser = await clerk.users.getUser(userId);

        const defaultUsername =
          clerkUser.username ||
          (clerkUser.emailAddresses[0]?.emailAddress
            ? clerkUser.emailAddresses[0].emailAddress.split('@')[0]
            : '');
            

        // Create user in database
        user = await db.user.create({
          data: {
            id: userId,
            username: defaultUsername,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            avatarUrl: clerkUser.imageUrl,
            bio: (clerkUser.publicMetadata?.bio as string) || '',
          },
          select: {
            id: true,
            username: true,
            bio: true,
            avatarUrl: true,
            posts: true,
            followers: true,
            following: true,
            likes: {
              select: {
                post: true,
              },
            },
          },
        });

        // Index the new user in Algolia
        await usersIndex.saveObject({
          objectID: user.id,
          username: user.username,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          followersCount: user.followers.length,
          followingCount: user.following.length,
          likesCount: user.likes.length,
          // Add other fields as necessary
        });
      } catch (error) {
        console.error('Error creating user in database or indexing:', error);
        return res.status(500).json({ error: 'Failed to create user profile.' });
      }
    }

    // Proceed as before
    const followersCount = await db.follow.count({
      where: { followingId: userId },
    });

    const followingCount = await db.follow.count({
      where: { followerId: userId },
    });

    const likesCount = await db.like.count({
      where: { post: { authorId: userId } },
    });

    // Serialize dates in posts
    const serializedPosts = user.posts
      ? user.posts.map((post) => ({
          ...post,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
        }))
      : [];

    return res.status(200).json({
      ...user,
      followersCount,
      followingCount,
      likesCount,
      posts: serializedPosts,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}