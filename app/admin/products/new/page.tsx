import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProduct({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const { error } = await searchParams;
  return <section><div className="mt-6 flex items-center justify-between gap-4"><div><h2 className="text-2xl font-black">Add product</h2><p className="mt-1 muted">Products remain inactive only when you choose that option.</p></div><Link href="/admin/products" className="font-bold">View products →</Link></div>{error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">Please check the required fields, URLs, category, and Amazon URL if provided.</p>}<ProductForm categories={categories} /></section>;
}
