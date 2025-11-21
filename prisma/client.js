// prisma/client.js
import { PrismaClient } from "../lib/generated/prisma"; // <- path to generated client

let db;

if (!global.db) {
  global.db = new PrismaClient();
}

db = global.db;

export { db };
