import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.post.findMany();
  }),
  createPost: publicProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string().optional(),
        fileUrl: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { title, fileUrl, content } = input;

      // Ensure the user is authenticated and userId exists
      if (!ctx.session?.userId) {
        throw new Error("User not authenticated");
      }

      // Create a new post in the database
      const post = await ctx.db.post.create({
        data: {
          title,
          content: content ?? '',
          fileUrl, 
          authorId: ctx.session.userId,  
        },
      });

      return post;
    }),
});
