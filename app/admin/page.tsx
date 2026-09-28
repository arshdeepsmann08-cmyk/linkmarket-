import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AmazonQuickImport } from "@/components/admin/AmazonQuickImport";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const recentlyAddedSince = new Date();
  recentlyAddedSince.setDate(recentlyAddedSince.getDate() - 30);

  const [totalProducts, activeProducts, totalClicks, recentlyAdded, recentProducts] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.click.count(),
    prisma.product.count({ where: { createdAt: { gte: recentlyAddedSince } } }),
    prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { category: true, _count: { select: { clicks: true } } },
    }),
  ]);

  return (
    <section>
      {/* Amazon Quick Import Tool */}
      <div className="mt-6">
        <AmazonQuickImport />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Total Products" value={totalProducts} />
        <Metric label="Active Products" value={activeProducts} />
        <Metric label="Total Clicks" value={totalClicks} />
        <Metric label="Products Added Recently" value={recentlyAdded} />
      </div>

      <section className="card mt-7 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black">Recent products</h2>
            <p className="mt-1 text-sm muted">Product clicks measure referrals, not purchases or commission.</p>
          </div>
          <Link href="/admin/products/new" className="btn btn-alt">
            + Add product manually
          </Link>
        </div>
        <div className="mt-5 space-y-3">
          {recentProducts.map((product) => (
            <div key={product.id} className="flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-sm">
              <div>
                <b>{product.title}</b>
                <span className="ml-2 muted">
                  {product.category.name} • {product.merchant}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span>{product._count.clicks} clicks</span>
                <span className={product.isActive ? "text-emerald-700" : "text-stone-500"}>
                  {product.isActive ? "Active" : "Inactive"}
                </span>
                <Link href={`/admin/products/${product.id}/edit`} className="font-bold">
                  Edit
                </Link>
              </div>
            </div>
          ))}
          {!recentProducts.length && (
            <p className="muted">No products yet. Use the Amazon Importer above to add your first product!</p>
          )}
        </div>
      </section>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5">
      <p className="text-sm muted">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}
