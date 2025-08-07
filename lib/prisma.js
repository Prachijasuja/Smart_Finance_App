import { PrismaClient } from './generated/prisma';

const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma || new PrismaClient();

if (!globalForPrisma.prisma) globalForPrisma.prisma = db;
