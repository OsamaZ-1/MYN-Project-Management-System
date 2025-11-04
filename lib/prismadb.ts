// lib/prismadb.ts
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Prevent multiple instances during development
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query"], // optional, logs all queries
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
