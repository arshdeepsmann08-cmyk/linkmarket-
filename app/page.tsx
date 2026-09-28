import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";

export default async function Home() {
  const [featured, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: { category: true },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ take: 8, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <section className="shell grid gap-10 py-16 lg:grid-cols-[1.2fr_.8fr] lg:py-24">
        <div>
          <p className="mb-3 font-bold text-mint uppercase tracking-wider text-xs">
            PRODUCT DISCOVERY, DONE RIGHT
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-[.98] tracking-tight sm:text-6xl">
            Discover products.<br />
            Share links.<br />
            <span className="text-mint">Earn commissions.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            LinkMarket helps you find genuinely useful products and share transparent, trackable recommendations.
          </p>
          <form action="/explore" className="mt-8 flex max-w-xl overflow-hidden rounded-2xl border border-stone-300 bg-white p-1">
            <input name="q" className="min-w-0 flex-1 px-4 outline-none" placeholder="Search brands, categories, merchants..." />
            <button className="btn">Explore</button>
          </form>
          <div className="mt-7 flex gap-5 text-sm font-semibold">
            <Link href="/explore">Browse all products →</Link>
            <Link href="/affiliate-disclosure">How we earn →</Link>
          </div>
        </div>
        <div className="card relative overflow-hidden bg-ink p-7 text-white flex flex-col justify-between">
          <div>
            <p className="text-mint font-bold text-xs uppercase tracking-wider">THIS WEEK&apos;S PICK</p>
            <h2 className="mt-3 text-3xl font-black">Thoughtful finds, not endless feeds.</h2>
            <p className="mt-4 text-slate-300">
              Every outbound purchase link is labeled and tracked safely through LinkMarket.
            </p>
          </div>
          <div className="absolute bottom-0 right-0 h-32 w-32 rounded-tl-full bg-mint opacity-80" />
        </div>
      </section>

      <section className="shell">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-bold text-mint text-xs uppercase tracking-wider">CURATED FOR YOU</p>
            <h2 className="text-3xl font-black">Featured products</h2>
          </div>
          <Link href="/explore" className="font-bold text-sm hover:underline">
            See all →
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.length ? (
            featured.map((product) => <ProductCard key={product.id} p={product} />)
          ) : (
            <p className="muted">No featured products yet.</p>
          )}
        </div>
      </section>

      <section className="shell py-16">
        <p className="font-bold text-mint text-xs uppercase tracking-wider">SHOP BY CATEGORY</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/explore?category=${category.slug}`}
              className="rounded-full bg-white px-5 py-3 font-bold shadow-sm hover:shadow-md transition-shadow border border-stone-200"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-ink py-16 text-white">
        <div className="shell grid gap-8 md:grid-cols-3">
          <Info n="01" title="Discover" text="Find useful products across curated categories from Amazon India & Flipkart." />
          <Info n="02" title="Share" text="Create transparent links for products you recommend to your audience." />
          <Info n="03" title="Track" text="See outbound clicks and verified commissions separately in your dashboard." />
        </div>
      </section>
    </>
  );
}

function Info({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div>
      <b className="text-mint text-sm">{n}</b>
      <h3 className="mt-2 text-xl font-bold">{title}</h3>
      <p className="mt-2 text-slate-300 text-sm leading-relaxed">{text}</p>
    </div>
  );
}
