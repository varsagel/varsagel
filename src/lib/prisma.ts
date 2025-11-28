import { PrismaClient } from "@prisma/client";

// Hot-reload sırasında tek bir PrismaClient instance’ı kullanmak için global tutuyoruz
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;