import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { currency } from "@/lib/utils";
import { AmazonQuickImport } from "@/components/admin/AmazonQuickImport";

export const dynamic = "force-dynamic";

export default async function Products({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    merchant?: string;
    status?: string;
    sort?: string;
    created?: string;
    updated?: string;
    deleted?: string;
  }>;
}) {
  let search: any = {};
  try {
    search = searchParams ? (await searchParams) : {};
  } catch (e) {
    search = {};
  }

  const andConditions: any[] = [];

  if (search?.q) {
    andConditions.push({
      OR: [
        { title: { contains: search.q, mode: "insensitive" } },
        { brand: { contains: search.q, mode: "insensitive" } },
        { merchant: { contains: search.q, mode: "insensitive" } },
      ],
    });
  }

  if (search?.category) andConditions.push({ categoryId: search.category });
  if (search?.merchant) andConditions.push({ merchant: search.merchant });
  if (search?.status === "active") andConditions.push({ isActive: true });
  if (search?.status === "inactive") andConditions.push({ isActive: false });

  const where = andConditions.length > 0 ? { AND: andConditions } : {};
  const orderBy = search?.sort === "oldest" ? { createdAt: "asc" as const } : { createdAt: "desc" as const };

  let products: any[] = [];
  let categories: any[] = [];
  let merchants: { merchant: string }[] = [];

  try {
    products = await prisma.product.findMany({
      where,
      include: { category: true, _count: { select: { clicks: true } } },
      orderBy,
    });
  } catch (err) {
    console.error("Error fetching products in admin:", err);
    products = [];
  }

  try {
    categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  } catch (err) {
    console.error("Error fetching categories in admin:", err);
    categories = [];
  }

  try {
    const rawMerchants = await prisma.product.findMany({
      select: { merchant: true },
      take: 100,
    });
    const uniqueMap = new Map();
    for (const item of rawMerchants) {
      if (item.merchant && !uniqueMap.has(item.merchant)) {
        uniqueMap.set(item.merchant, { merchant: String(item.merchant) });
      }
    }
    merchants = Array.from(uniqueMap.values()).sort((a, b) =>
      String(a.merchant).localeCompare(String(b.merchant))
    );
  } catch (err) {
    console.error("Error fetching merchants in admin:", err);
    merchants = [];
  }

  return (
    <section>
      {/* Amazon Quick Import Box right at top of Products page */}
      <div className="mt-6">
        <AmazonQuickImport />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 mt-8">
        <div>
          <h2 className="text-2xl font-black">All Products ({products.length})</h2>
          <p className="mt-1 muted">
            Manage your store items, edit details, toggle visibility, or delete unwanted products.
          </p>
        </div>
        <Link href="/admin/products/new" className="btn btn-alt">
          + Full Product Form
        </Link>
      </div>

      {(search?.created || search?.updated) && (
        <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 font-bold border border-emerald-200">
          ? Product saved successfully.
        </p>
      )}

      {search?.deleted && (
        <p className="mt-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 font-bold border border-amber-200">
          ?? Product deleted successfully.
        </p>
      )}

      <form className="card mt-5 grid gap-3 p-4 md:grid-cols-5">
        <input className="field" name="q" placeholder="Search name, brand, merchant" defaultValue={search?.q || ""} />
        <select className="field" name="category" defaultValue={search?.category || ""}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select className="field" name="merchant" defaultValue={search?.merchant || ""}>
          <option value="">All merchants</option>
          {merchants.map((m) => (
            <option key={m.merchant} value={m.merchant}>
              {m.merchant}
            </option>
          ))}
        </select>
        <select className="field" name="status" defaultValue={search?.status || ""}>
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <div className="flex gap-2">
          <select className="field" name="sort" defaultValue={search?.sort || "newest"}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          <button className="btn cursor-pointer">Apply</button>
        </div>
      </form>

      <div className="card mt-5 overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="border-b bg-stone-50 text-slate-500">
            <tr>
              <th className="p-3">Image</th>
              <th>Product</th>
              <th>Merchant</th>
              <th>Price</th>
              <th>Category</th>
              <th>Status</th>
              <th>Clicks</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              let formattedPrice = "?0";
              try {
                formattedPrice = currency(p.price, p.currency || "INR");
              } catch {
                formattedPrice = "?0";
              }

              let createdDateStr = "-";
              try {
                if (p.createdAt) {
                  createdDateStr = new Date(p.createdAt).toLocaleDateString();
                }
              } catch {
                createdDateStr = "-";
              }

              return (
                <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50/50">
                  <td className="p-3">
                    <img
                      src={p.imageUrl || "https://placehold.co/100x100/f1f5f9/64748b?text=Product"}
                      alt=""
                      className="h-10 w-10 rounded object-cover bg-slate-100 border border-slate-200"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://placehold.co/100x100/f1f5f9/64748b?text=Product";
                      }}
                    />
                  </td>
                  <td className="max-w-[220px]">
                    <b className="line-clamp-1">{p.title || "Untitled Product"}</b>
                    {p.brand && <span className="block muted text-xs">{p.brand}</span>}
                  </td>
                  <td>{p.merchant || "Amazon"}</td>
                  <td className="font-bold">{formattedPrice}</td>
                  <td>{p.category?.name || "Uncategorized"}</td>
                  <td>
                    <span className={p.isActive ? "text-emerald-700 font-semibold" : "text-stone-500"}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="font-medium">{p._count?.clicks || 0}</td>
                  <td className="text-xs muted">{createdDateStr}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <Link className="font-bold text-slate-800 hover:underline text-xs" href={`/admin/products/${p.id}/edit`}>
                        Edit
                      </Link>
                      <form action={`/api/admin/products/${p.id}`} method="post" className="inline">
                        <input type="hidden" name="intent" value="toggle-active" />
                        <button className="font-bold text-amber-800 hover:underline cursor-pointer text-xs">
                          {p.isActive ? "Deactivate" : "Reactivate"}
                        </button>
                      </form>
                      <form
                        action={`/api/admin/products/${p.id}`}
                        method="post"
                        className="inline"
                        onSubmit={(e) => {
                          if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="intent" value="delete" />
                        <button className="font-bold text-red-600 hover:text-red-800 hover:underline cursor-pointer text-xs">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!products.length && (
          <div className="p-8 text-center muted">
            <p className="font-bold text-base text-slate-700">No products found</p>
            <p className="mt-1 text-xs">Use the Amazon Importer above or click "+ Full Product Form" to add your first product!</p>
          </div>
        )}
      </div>
    </section>
  );
}

