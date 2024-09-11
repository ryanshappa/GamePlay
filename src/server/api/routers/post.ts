// src/server/api/routers/post.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  // Fetch all posts
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.post.findMany();
  }),

  // Fetch a post by its ID
  getPostById: publicProcedure
    .input(z.object({ id: z.number() }))  // Expecting the post id to be a number
    .query(async ({ input, ctx }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.id },
      });
      if (!post) throw new Error("Post not found");
      return post;
    }),

  // Create a new post
  createPost: publicProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string().optional(),  // Optional content
        fileUrl: z.string(),  // URL of the uploaded file
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.userId) {
        throw new Error("User not authenticated");
      }

      const post = await ctx.db.post.create({
        data: {
          title: input.title,
          content: input.content || '',
          fileUrl: input.fileUrl,
          authorId: ctx.session.userId,  // Assign the post to the logged-in user
        },
      });

      return post;
    }),
});
