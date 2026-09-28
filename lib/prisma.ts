import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres.mgeabxayvpnuouaztdls:fCqeLCgVEtX7wykg@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=30&pool_timeout=30";

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
