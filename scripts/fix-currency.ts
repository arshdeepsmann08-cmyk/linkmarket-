import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.product.updateMany({
    where: { currency: 'USD' },
    data: { currency: 'INR' },
  });
  console.log(Updated \ products from USD to INR);
}

main()
  .catch(console.error)
  .finally(() => prisma.\());

