// src/server/db.ts
import { PrismaClient } from "@prisma/client";

// Initialize the Prisma Client
export const db = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],  // You can adjust these for your logging needs
});
