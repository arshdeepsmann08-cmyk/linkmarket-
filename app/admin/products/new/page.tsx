import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

const DEFAULT_CATEGORIES = [
  { id: "cat-electronics", name: "Electronics" },
  { id: "cat-fashion", name: "Fashion & Lifestyle" },
  { id: "cat-home", name: "Home & Kitchen" },
  { id: "cat-gadgets", name: "Gadgets & Accessories" },
  { id: "cat-beauty", name: "Beauty & Personal Care" },
];

export default async function NewProduct({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  let categories: { id: string; name: string }[] = [];
  try {
    categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    if (!categories.length) {
      for (const cat of DEFAULT_CATEGORIES) {
        const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const created = await prisma.category.upsert({
          where: { slug },
          update: { name: cat.name },
          create: { name: cat.name, slug },
        });
        categories.push(created);
      }
    }
  } catch {
    categories = DEFAULT_CATEGORIES;
  }

  const { error } = await searchParams;

  return (
    <section>
      <div className="mt-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">Add Product</h2>
          <p className="mt-1 muted">Paste an Amazon URL to auto-extract product title, image, price & affiliate link.</p>
        </div>
        <Link href="/admin/products" className="font-bold text-sm hover:underline">
          View products ➔
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
