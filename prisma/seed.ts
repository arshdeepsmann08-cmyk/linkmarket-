import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { slugify } from "../lib/utils";

// Load .env if not loaded
if (!process.env.DATABASE_URL) {
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
}

const prisma = new PrismaClient();

const amazonTag = process.env.AMAZON_AFFILIATE_TAG || "linkmarket-21";
const flipkartId = process.env.FLIPKART_AFFILIATE_ID || "linkmarket";

async function main() {
  const jsonPath = path.join(__dirname, "products.json");
  const rawData = fs.readFileSync(jsonPath, "utf8").replace(/^\uFEFF/, "");
  const products = JSON.parse(rawData);

  console.log("Seeding categories...");
  const categories = [...new Set(products.map((p: any) => p.category))];
  for (const cat of categories) {
    const slug = slugify(cat as string);
    await prisma.category.upsert({
      where: { slug },
      update: { name: cat as string },
      create: { name: cat as string, slug },
    });
  }

  const allCategories = await prisma.category.findMany();

  console.log(`Seeding ${products.length} products...`);
  for (const p of products) {
    const category = allCategories.find((c) => c.name === p.category);
    if (!category) continue;

    const slug = slugify(p.title);
    let affiliateUrl = p.affiliateUrl;

    if (p.source === "AMAZON" && !affiliateUrl.includes("tag=")) {
      affiliateUrl = `${affiliateUrl}?tag=${amazonTag}`;
    } else if (p.source === "FLIPKART" && !affiliateUrl.includes("affid=")) {
      affiliateUrl = `${affiliateUrl}?affid=${flipkartId}`;
    }

    await prisma.product.upsert({
      where: { slug },
      update: {
        title: p.title,
        description: p.description,
        price: p.price,
        currency: p.currency || "INR",
        imageUrl: p.imageUrl,
        productUrl: p.productUrl,
        affiliateUrl,
        categoryId: category.id,
        brand: p.brand,
        rating: p.rating,
        availability: p.availability || "In stock",
        merchant: p.merchant,
        source: p.source || "MANUAL",
        sourceProductId: p.sourceProductId,
        isFeatured: Boolean(p.isFeatured),
        isActive: true,
      },
      create: {
        title: p.title,
        slug,
        description: p.description,
        price: p.price,
        currency: p.currency || "INR",
        imageUrl: p.imageUrl,
        productUrl: p.productUrl,
        affiliateUrl,
        categoryId: category.id,
        brand: p.brand,
        rating: p.rating,
        availability: p.availability || "In stock",
        merchant: p.merchant,
        source: p.source || "MANUAL",
        sourceProductId: p.sourceProductId,
        isFeatured: Boolean(p.isFeatured),
        isActive: true,
      },
    });
  }

  console.log("Seeding demo admin account...");
  await prisma.user.upsert({
    where: { email: "admin@linkmarket.demo" },
    update: {},
    create: {
      name: "Demo Admin",
      email: "admin@linkmarket.demo",
      passwordHash: await bcrypt.hash("ChangeMe123!", 12),
      role: Role.ADMIN,
    },
  });

  console.log("Successfully seeded database with real Amazon & Flipkart products!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
