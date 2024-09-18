import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";

export const createContext = async ({ req }: CreateNextContextOptions) => {
  const { userId } = getAuth(req);

  return {
    req,
    db,
    userId,
  };
};

const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next();
});
