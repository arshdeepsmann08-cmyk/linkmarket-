import { PrismaClient, Role } from "@prisma/client";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) throw new Error("Usage: npm run admin:grant -- admin@example.com");

const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.update({ where: { email }, data: { role: Role.ADMIN }, select: { email: true, role: true } });
  console.log(`Granted ${user.role} to ${user.email}`);
}
main().finally(() => prisma.$disconnect());
