import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currency } from "@/lib/utils";
import { ProductCard } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";

export default async function Product({ params }: { params: Promise<{ slug: string }> }) {
  const value = (await params).slug;
  const product = await prisma.product.findFirst({
    where: { isActive: true, OR: [{ slug: value }, { id: value }] },
    include: { category: true }
  });
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, isActive: true, NOT: { id: product.id } },
    include: { category: true },
    take: 3
  });

  const amazonDisclosure = product.source === "AMAZON" || /amazon/i.test(product.merchant);
  const flipkartDisclosure = product.source === "FLIPKART" || /flipkart/i.test(product.merchant);

  // Legacy products were saved with currency "USD" — treat them as INR for India marketplace
  const currencyCode =
    !product.currency || product.currency === "USD" ? "INR" : product.currency;

  return (
    <div className="shell py-10">
      <div className="grid gap-8 md:grid-cols-2">
        <ProductImage src={product.imageUrl} alt={product.title} className="card h-96 w-full object-cover bg-slate-100" />
        <div>
          <p className="font-bold text-mint">{product.category.name} • {product.merchant}</p>
          <h1 className="mt-2 text-4xl font-black">{product.title}</h1>
          {product.brand && <p className="mt-2 text-sm text-slate-500">Brand: {product.brand}</p>}
          <p className="mt-3 text-lg font-bold text-amber-600">★ {product.rating.toFixed(1)} rating</p>
          <p className="mt-5 leading-7 text-slate-600">{product.description}</p>
          <p className="mt-7 text-3xl font-black">{currency(product.price, currencyCode)}</p>
          <p className="mt-2 text-sm text-slate-500">Availability: {product.availability}</p>
          <a href={`/go/${product.id}`} target="_blank" rel="noopener noreferrer" className="btn mt-6 inline-flex items-center gap-2 text-base">
            Buy now on {product.merchant} →
          </a>
          <p className="mt-3 text-xs text-slate-500">
            You will be redirected to {product.merchant}. This is a verified affiliate purchase link.
          </p>
          {amazonDisclosure && (
            <p className="mt-2 text-xs text-slate-500">As an Amazon Associate, I earn from qualifying purchases.</p>
          )}
          {flipkartDisclosure && (
            <p className="mt-2 text-xs text-slate-500">As a Flipkart Affiliate partner, I earn from qualifying purchases.</p>
          )}
        </div>
      </div>
      <section className="mt-16">
        <h2 className="text-2xl font-black">More in {product.category.name}</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {related.map(item => <ProductCard key={item.id} p={item} />)}
        </div>
      </section>
    </div>
  );
}