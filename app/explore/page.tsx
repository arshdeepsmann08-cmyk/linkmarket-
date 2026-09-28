import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";

export default async function Explore({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; sort?: string }> }) {
  const search = await searchParams;
  const where: any = { isActive: true, AND: [] };
  if (search.q) where.AND.push({ OR: [{ title: { contains: search.q, mode: "insensitive" } }, { brand: { contains: search.q, mode: "insensitive" } }, { merchant: { contains: search.q, mode: "insensitive" } }, { category: { is: { name: { contains: search.q, mode: "insensitive" } } } }] });
  if (search.category) where.AND.push({ category: { is: { slug: search.category } } });
  const orderBy = search.sort === "price" ? { price: "asc" as const } : search.sort === "popular" ? { clicks: { _count: "desc" as const } } : { createdAt: "desc" as const };
  const [products, categories] = await Promise.all([prisma.product.findMany({ where, include: { category: true }, orderBy }), prisma.category.findMany({ orderBy: { name: "asc" } })]);
  return <div className="shell py-10"><p className="font-bold text-mint">MARKETPLACE</p><h1 className="text-4xl font-black">Explore products</h1><form className="card mt-6 grid gap-3 p-4 md:grid-cols-3"><input className="field" name="q" defaultValue={search.q} placeholder="Search product, brand, category, merchant" /><select className="field" name="category" defaultValue={search.category}><option value="">All categories</option>{categories.map(category => <option value={category.slug} key={category.id}>{category.name}</option>)}</select><div className="flex gap-2"><select className="field" name="sort" defaultValue={search.sort}><option value="newest">Newest</option><option value="price">Price: low to high</option><option value="popular">Popularity</option></select><button className="btn">Apply</button></div></form><p className="mt-6 text-sm text-slate-600">{products.length} products found</p><div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{products.map(product => <ProductCard key={product.id} p={product} />)}</div>{!products.length && <div className="card mt-5 p-8 text-center muted">No active products match that search.</div>}</div>;
}
