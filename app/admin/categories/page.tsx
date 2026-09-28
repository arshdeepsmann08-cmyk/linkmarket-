import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Categories() {
  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
  } catch (e) {
    console.error("Error fetching categories in admin:", e);
    categories = [];
  }

  return (
    <section>
      <h2 className="mt-6 text-2xl font-black">Categories</h2>
      <p className="mt-1 muted">Create or rename the product categories used in public navigation.</p>
      <form action="/api/admin/categories" method="post" className="card mt-5 flex flex-col gap-3 p-5 sm:flex-row">
        <input className="field" name="name" required placeholder="New category name" maxLength={80} />
        <button className="btn btn-alt">Create category</button>
      </form>
      <div className="card mt-5 divide-y">
        {categories.map((category) => (
          <form key={category.id} action="/api/admin/categories" method="post" className="flex flex-wrap items-center gap-3 p-4">
            <input type="hidden" name="id" value={category.id} />
            <input className="field max-w-sm" name="name" defaultValue={category.name} required maxLength={80} />
            <span className="text-sm muted">{category._count?.products || 0} products</span>
            <button className="font-bold text-mint cursor-pointer">Save</button>
          </form>
        ))}
        {!categories.length && <p className="p-5 muted">No categories exist yet.</p>}
      </div>
    </section>
  );
}
