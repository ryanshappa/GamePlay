import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { ensureUserExists } from "~/utils/userUtils";

export const postRouter = createTRPCRouter({
  // Fetch all posts
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.post.findMany();
  }),

  // Fetch a post by its ID
  getPostById: publicProcedure
    .input(z.object({ id: z.number() })) 
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
