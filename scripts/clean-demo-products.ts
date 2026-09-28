import fs from "fs";
import path from "path";

const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8").replace(/^\uFEFF/, "");
  for (const line of envContent.split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let val = match[2] || "";
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      process.env[match[1]] = val;
    }
  }
}

import { prisma } from "../lib/prisma";

async function cleanDemoProducts() {
  // Find products that have example.com in affiliateUrl or productUrl or merchant is 'Demo Merchant'
  const demoProducts = await prisma.product.findMany({
    where: {
      OR: [
        { affiliateUrl: { contains: "example.com" } },
        { merchant: "Demo Merchant" },
        { productUrl: { contains: "example.com" } }
      ]
    }
  });

  console.log(`Found ${demoProducts.length} demo products with example.com URLs.`);
  
  if (demoProducts.length > 0) {
    // Delete any clicks or commissions associated with demo products first
    const demoIds = demoProducts.map(p => p.id);
    await prisma.click.deleteMany({ where: { productId: { in: demoIds } } });
    await prisma.commission.deleteMany({ where: { productId: { in: demoIds } } });
    const deleted = await prisma.product.deleteMany({ where: { id: { in: demoIds } } });
    console.log(`Removed ${deleted.count} placeholder demo products.`);
  }

  // Ensure all remaining products are active and set to currency INR
  await prisma.product.updateMany({
    data: {
      currency: "INR",
      isActive: true
    }
  });

  const remaining = await prisma.product.findMany({
    select: { id: true, title: true, price: true, currency: true, merchant: true }
  });
  console.log(`Active real products count: ${remaining.length}`);
  console.log("All products now use currency: INR (₹)");
}

cleanDemoProducts().finally(() => prisma.$disconnect());
