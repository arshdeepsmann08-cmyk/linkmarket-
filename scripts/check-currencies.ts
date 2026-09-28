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

async function run() {
  const products = await prisma.product.findMany({
    select: { id: true, title: true, price: true, currency: true }
  });
  console.log("Total products count:", products.length);
  const byCurrency: Record<string, number> = {};
  for (const p of products) {
    byCurrency[p.currency] = (byCurrency[p.currency] || 0) + 1;
  }
  console.log("Currencies in DB:", byCurrency);

  const nonINR = products.filter(p => p.currency !== "INR");
  if (nonINR.length > 0) {
    console.log(`Updating ${nonINR.length} products to INR...`);
    await prisma.product.updateMany({
      where: { currency: "USD" },
      data: { currency: "INR" }
    });
    console.log("Updated non-INR products to INR.");
  }
}

run().finally(() => prisma.$disconnect());
