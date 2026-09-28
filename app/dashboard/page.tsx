import { requireUser } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { currency } from "@/lib/utils";
import { AmazonQuickImport } from "@/components/admin/AmazonQuickImport";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const s = await requireUser();

  let clicks: any[] = [];
  try {
    clicks = await prisma.click.findMany({
      where: { referrerUserId: s.id },
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  } catch (e) {
    console.error("Dashboard clicks error:", e);
  }

  const total = clicks.length;

  return (
    <div className="shell py-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="font-bold text-mint">YOUR DASHBOARD</p>
          <h1 className="text-4xl font-black">Hi, {s.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products/new" className="btn btn-alt">
            + Full Product Form
          </Link>
          <Link href="/admin/products" className="btn">
            Manage Products
          </Link>
        </div>
      </div>

      {/* Amazon 1-Click Product Importer right inside Dashboard */}
      <div className="mt-8">
        <AmazonQuickImport />
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <Metric label="Tracked clicks" value={total} />
        <Metric label="Estimated earnings" value={currency(0)} />
        <Metric label="Confirmed earnings" value={currency(0)} />
      </div>

      <section className="card mt-7 p-6">
        <h2 className="text-xl font-black">My referral links</h2>
        <p className="mt-2 muted">
          Share product links in this format: <code>/go/product-id?ref={s.id}</code>
        </p>
        <h3 className="mt-6 font-bold">Recent activity</h3>
        {clicks.length ? (
          clicks.map((c) => (
            <p key={c.id} className="border-t py-3 text-sm">
              Clicked <b>{c.product.title}</b> • {new Date(c.createdAt).toLocaleDateString()}
            </p>
          ))
        ) : (
          <p className="mt-3 muted">No referral clicks yet. Add products and share your link to start earning!</p>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-5">
      <p className="text-sm muted">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}
