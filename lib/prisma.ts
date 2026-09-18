import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres.mgeabxayvpnuouaztdls:Pza0kpYzcVG4LXK9@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
