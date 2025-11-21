import { PrismaClient } from "@prisma/client";

let prisma;

if (!global.prisma) {
  global.prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"], // optional for debugging
  });
}

prisma = global.prisma;

export const db = prisma;
