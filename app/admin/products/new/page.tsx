import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { AmazonQuickImport } from "@/components/admin/AmazonQuickImport";

export const dynamic = "force-dynamic";

const DEFAULT_CATEGORIES = [
  { id: "cat-electronics", name: "Electronics" },
  { id: "cat-fashion", name: "Fashion & Lifestyle" },
  { id: "cat-home", name: "Home & Kitchen" },
  { id: "cat-gadgets", name: "Gadgets & Accessories" },
  { id: "cat-beauty", name: "Beauty & Personal Care" },
];

export default async function NewProduct({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  let categories: { id: string; name: string }[] = [];
  try {
    categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    if (!categories.length) {
      for (const cat of DEFAULT_CATEGORIES) {
        const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        try {
          const created = await prisma.category.upsert({
            where: { slug },
            update: { name: cat.name },
            create: { name: cat.name, slug },
          });
          categories.push(created);
        } catch {
          categories.push(cat);
        }
      }
    }
  } catch (e) {
    console.error("Error loading categories for new product:", e);
    categories = DEFAULT_CATEGORIES;
  }

  const resolvedSearch = (await searchParams) || {};
  const error = resolvedSearch?.error;

  return (
    <section>
      {/* 1-Click Amazon Importer Box */}
      <div className="mt-6">
        <AmazonQuickImport />
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 border-t border-stone-200 pt-6">
        <div>
          <h2 className="text-2xl font-black">Or Add Product Manually</h2>
          <p className="mt-1 muted">
            Fill in product information manually or use the auto-fill tool below.
          </p>
        </div>
        <Link href="/admin/products" className="font-bold text-sm hover:underline">
          View all products →
        </Link>
      </div>

      {error && (
        <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">
          Please check the required fields, URLs, category, and Amazon URL if provided.
        </p>
      )}

      <ProductForm categories={categories} />
    </section>
  );
}
