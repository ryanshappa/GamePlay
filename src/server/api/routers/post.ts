import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { ensureUserExists } from "~/utils/userUtils";

export const postRouter = createTRPCRouter({
  // Fetch all posts
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.userId;
      if (!userId) throw new Error("User not authenticated");
      return ctx.db.post.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: 'desc' },
      });
    }),

  // Fetch posts with cursor-based pagination for infinite scroll
  getInfinitePosts: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(5),
      cursor: z.string().nullish(),
      mobileOnly: z.boolean().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const { limit, cursor, mobileOnly } = input;
      const posts = await ctx.db.post.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        where: mobileOnly ? { isMobileFriendly: true } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          author: true,
          _count: { select: { likes: true, comments: true } },
        },
      });

      let nextCursor: string | undefined;
      if (posts.length > limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem?.id;
      }

      // Serialize posts for the frontend
      const serializedPosts = posts.map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        fileUrl: post.fileUrl || null,
        status: post.status,
        authorId: post.authorId,
        author: {
          id: post.author.id,
          username: post.author.username || 'Unknown',
          avatarUrl: post.author.avatarUrl || null,
        },
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
        likedByCurrentUser: false,
        savedByCurrentUser: false,
      }));

      return { posts: serializedPosts, nextCursor };
    }),

  // Fetch a post by its ID
  getPostById: publicProcedure
    .input(z.object({ id: z.string() })) 
    .query(async ({ input, ctx }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.id }, 
      });
      if (!post) throw new Error("Post not found");
      return post;
    }),

  // Create a new post
  createPost: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string().optional(),
        fileUrl: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.userId;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      await ensureUserExists(userId);

      const post = await ctx.db.post.create({
        data: {
          title: input.title,
          content: input.content ?? "",
          fileUrl: input.fileUrl,
          authorId: userId,
        },
      });

      return post;
    }),
});
