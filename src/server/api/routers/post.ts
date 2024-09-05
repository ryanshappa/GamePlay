// src/server/api/routers/post.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postRouter = createTRPCRouter({
  // Fetch all posts
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.post.findMany();
  }),

  // Fetch posts by a specific user
  getPostsByUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.db.post.findMany({
        where: { authorId: parseInt(input.userId) },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Fetch post by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      return ctx.db.post.findUnique({
        where: { id: input.id },
      });
    }),

  // Create a new post
  createPost: publicProcedure
    .input(z.object({
      title: z.string(),
      fileUrl: z.string(),
      authorId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.post.create({
        data: {
          title: input.title,
          fileUrl: input.fileUrl,
          authorId: parseInt(input.authorId),
          content: "", // Add this line to include the content property
        },
      });
    }),
});
