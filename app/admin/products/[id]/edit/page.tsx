import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProduct({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const resolvedSearch = (await searchParams) || {};

  let product = null;
  let categories: any[] = [];

  try {
    const [p, cats] = await Promise.all([
      prisma.product.findUnique({ where: { id } }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
    ]);
    product = p;
    categories = cats;
  } catch (err) {
    console.error("Error loading product for edit:", err);
  }

  if (!product) notFound();

  return (
    <section>
      <h2 className="mt-6 text-2xl font-black">Edit product</h2>
      {resolvedSearch?.error && (
        <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">
          The product was not saved. Check all required fields.
        </p>
      )}
      <ProductForm categories={categories} product={product} />
    </section>
  );
}
