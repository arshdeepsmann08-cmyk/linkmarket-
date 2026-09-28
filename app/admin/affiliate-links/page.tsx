import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AffiliateLinks() {
  const products = await prisma.product.findMany({ select: { id: true, title: true, merchant: true, affiliateUrl: true, productUrl: true, source: true, sourceProductId: true, isActive: true }, orderBy: { updatedAt: "desc" } });
  return <section><h2 className="mt-6 text-2xl font-black">Affiliate links</h2><p className="mt-1 muted">Links are visible only to admins. Outbound clicks go through LinkMarket’s validated redirect route.</p><div className="card mt-5 divide-y">{products.map(p => <div className="p-4" key={p.id}><div className="flex flex-wrap items-center justify-between gap-2"><b>{p.title}</b><Link href={`/admin/products/${p.id}/edit`} className="font-bold text-mint">Manage link →</Link></div><p className="mt-1 text-sm muted">{p.merchant} · {p.isActive ? "Active" : "Inactive"} · {p.source}{p.sourceProductId ? ` (${p.sourceProductId})` : ""}</p><p className="mt-3 break-all text-sm"><span className="font-bold">Affiliate URL:</span> {p.affiliateUrl}</p><p className="mt-1 break-all text-sm muted">Product URL: {p.productUrl}</p></div>)}{!products.length && <p className="p-5 muted">No affiliate links yet.</p>}</div></section>;
}
