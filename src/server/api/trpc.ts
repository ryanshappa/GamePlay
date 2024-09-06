import { initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "~/server/db";

type CreateContextOptions = Record<string, never>;

// This helper generates the "internals" for a tRPC context
const createInnerTRPCContext = (_opts: CreateContextOptions) => {
  return {
    db,
  };
};

// Actual context you will use in your router, now includes session data
export const createTRPCContext = (opts: CreateNextContextOptions) => {
  const { req } = opts;
  const auth = getAuth(req); // Clerk's getAuth to retrieve session
  const session = auth.sessionId ? auth : null; // Set session info

  return {
    db,
    session,
  };
};

// Initialize tRPC API
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

// Public (unauthenticated) procedure with timing middleware
export const publicProcedure = t.procedure.use(
  t.middleware(async ({ next, path }) => {
    const start = Date.now();
    const result = await next();
    const end = Date.now();
    console.log(`[TRPC] ${path} took ${end - start}ms to execute`);
    return result;
  })
);
