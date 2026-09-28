import Link from "next/link";
import { currency } from "@/lib/utils";
import { ProductImage } from "@/components/ProductImage";

export function ProductCard({ p }: { p: any }) {
  // Treat USD as INR for India-sourced products (legacy DB default was USD)
  const currencyCode =
    !p.currency || p.currency === "USD"
      ? "INR"
      : p.currency;

  return (
    <article className="card overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <ProductImage
          src={p.imageUrl}
          alt={p.title}
          className="h-48 w-full object-cover bg-slate-100"
        />
        <div className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-mint">{p.category?.name || "Product"}</span>
            <span className="text-xs font-semibold text-slate-500">{p.merchant}</span>
          </div>
          <h3 className="mt-1 font-bold text-base line-clamp-2 text-slate-900">{p.title}</h3>
          {p.brand && <p className="mt-1 text-xs text-slate-500">{p.brand}</p>}
          <p className="mt-2 line-clamp-2 text-xs text-slate-600 leading-relaxed">{p.description}</p>
        </div>
      </div>
      <div className="p-4 pt-0">
        <div className="mt-2 flex items-center justify-between border-t border-stone-100 pt-3">
          <span className="font-black text-lg text-slate-950">{currency(p.price, currencyCode)}</span>
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">? {p.rating ? Number(p.rating).toFixed(1) : "4.5"}</span>
        </div>
        <Link href={`/products/${p.slug}`} className="btn mt-3 w-full text-xs font-bold py-2.5 text-center">
          View details &amp; buy
        </Link>
      </div>
    </article>
  );
}

