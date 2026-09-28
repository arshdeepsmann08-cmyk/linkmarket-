import { prisma } from "@/lib/prisma";

function startOfToday() { const date = new Date(); date.setHours(0, 0, 0, 0); return date; }
function daysAgo(days: number) { const date = startOfToday(); date.setDate(date.getDate() - days); return date; }

export default async function Analytics() {
  const [total, today, week, month, grouped] = await Promise.all([
    prisma.click.count(), prisma.click.count({ where: { createdAt: { gte: startOfToday() } } }), prisma.click.count({ where: { createdAt: { gte: daysAgo(7) } } }), prisma.click.count({ where: { createdAt: { gte: daysAgo(30) } } }),
    prisma.click.groupBy({ by: ["productId"], _count: { _all: true }, orderBy: { _count: { productId: "desc" } }, take: 20 }),
  ]);
  const productIds = grouped.map(row => row.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, title: true, merchant: true, isActive: true } });
  const byId = new Map(products.map(p => [p.id, p]));
  return <section><h2 className="mt-6 text-2xl font-black">Click analytics</h2><p className="mt-1 muted">Clicks are outbound referrals. They do not indicate sales, purchases, or commissions.</p><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Total clicks" value={total} /><Metric label="Clicks today" value={today} /><Metric label="Clicks this week" value={week} /><Metric label="Clicks this month" value={month} /></div><div className="card mt-6 overflow-x-auto p-5"><h3 className="text-xl font-black">Clicks by product</h3><table className="mt-4 w-full min-w-[500px] text-left text-sm"><thead><tr className="text-slate-500"><th>Product</th><th>Merchant</th><th>Status</th><th>Clicks</th></tr></thead><tbody>{grouped.map(row => { const product = byId.get(row.productId); return <tr className="border-t" key={row.productId}><td className="py-3 font-bold">{product?.title || "Deleted product"}</td><td>{product?.merchant || "—"}</td><td>{product ? (product.isActive ? "Active" : "Inactive") : "Unavailable"}</td><td>{row._count._all}</td></tr>; })}</tbody></table>{!grouped.length && <p className="mt-4 muted">No tracked clicks yet.</p>}</div></section>;
}
function Metric({ label, value }: { label: string; value: number }) { return <div className="card p-5"><p className="text-sm muted">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>; }
