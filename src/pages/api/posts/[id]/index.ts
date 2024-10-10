import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '~/server/db';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { userId } = getAuth(req);

	if (!userId) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	const postId = parseInt(req.query.id as string, 10);

	if (isNaN(postId)) {
		return res.status(400).json({ error: 'Invalid post ID' });
	}

	if (req.method === 'DELETE') {
		try {
			const post = await db.post.findUnique({
				where: { id: postId },
			});

			if (!post || post.authorId !== userId) {
				return res.status(403).json({ error: 'You do not have permission to delete this post.' });
			}

			// Delete associated comments and likes
			await db.comment.deleteMany({ where: { postId } });
			await db.like.deleteMany({ where: { postId } });

			// Delete the post
			await db.post.delete({ where: { id: postId } });

			res.status(200).json({ message: 'Post deleted successfully.' });
		} catch (error) {
			console.error('Error deleting post:', error);
			res.status(500).json({ error: 'Internal server error.' });
		}
	} else {
		res.setHeader('Allow', ['DELETE']);
		res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
	}
}
