"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function AmazonQuickImport() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [createdProduct, setCreatedProduct] = useState<any>(null);
  const [fetchedData, setFetchedData] = useState<any>(null);
  const router = useRouter();

  const handleFetch = async () => {
    if (!url.trim()) {
      setError("Please paste an Amazon URL or ASIN.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setCreatedProduct(null);
    setFetchedData(null);

    try {
      const res = await fetch("/api/admin/amazon-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to fetch Amazon details.");
      }

      setFetchedData(json.data);
      setSuccessMsg(`Fetched details for "${json.data.title.slice(0, 50)}..."! Click 'Publish Now' below to add it instantly.`);
    } catch (err: any) {
      setError(err?.message || "Could not fetch Amazon product. Please check the URL.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishNow = async () => {
    if (!fetchedData) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fetchedData.title,
          description: fetchedData.description || `Buy ${fetchedData.title} on Amazon India.`,
          imageUrl: fetchedData.imageUrl,
          productUrl: fetchedData.productUrl,
          affiliateUrl: fetchedData.affiliateUrl,
          price: fetchedData.price,
          currency: fetchedData.currency || "INR",
          brand: fetchedData.brand || "Amazon",
          rating: fetchedData.rating || 4.5,
          availability: fetchedData.availability || "In stock",
          merchant: fetchedData.merchant || "Amazon India",
          source: "AMAZON",
          sourceProductId: fetchedData.asin,
          isFeatured: true,
          isActive: true,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to publish product.");
      }

      setCreatedProduct(json.product);
      setSuccessMsg(`Successfully published "${json.product.title.slice(0, 40)}..." to LinkMarket!`);
      setUrl("");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Could not publish product to database.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-5 bg-gradient-to-r from-amber-500/10 via-amber-100/50 to-amber-50 border-2 border-amber-400/80 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-black text-amber-950 text-lg flex items-center gap-2">
          <span>⚡</span> Amazon 1-Click Product Importer
        </h3>
        <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
          Instant Auto-Fill & Monetization
        </span>
      </div>
      <p className="mt-1 text-xs text-amber-900/80 font-medium">
        Paste any Amazon India or Amazon.com URL or ASIN to automatically fetch product title, image, price in ₹ INR, and affiliate link.
      </p>

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <input
          type="url"
          className="field flex-1 text-sm bg-white border-amber-300 focus:border-amber-500 font-medium"
          placeholder="Paste Amazon link here: https://www.amazon.in/dp/B08N5WRWNW"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleFetch();
            }
          }}
        />
        <button
          type="button"
          onClick={handleFetch}
          disabled={loading}
          className="btn bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-3 px-5 rounded-xl flex items-center justify-center gap-2 whitespace-nowrap transition-colors shadow-xs cursor-pointer"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Fetching from Amazon...
            </>
          ) : (
            "✨ Auto-Fetch Product Details"
          )}
        </button>
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-xl bg-red-100 border border-red-300 text-red-900 text-xs font-bold">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mt-3 p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between flex-wrap gap-2">
          <span>{successMsg}</span>
          {createdProduct && (
            <Link
              href={`/products/${createdProduct.slug || createdProduct.id}`}
              className="underline text-emerald-950 font-black hover:text-black"
              target="_blank"
            >
              View Live Product ↗
            </Link>
          )}
        </div>
      )}

      {/* Preview Card & 1-Click Publish */}
      {fetchedData && !createdProduct && (
        <div className="mt-4 p-4 rounded-xl bg-white border border-amber-200 grid gap-4 sm:grid-cols-[100px_1fr] items-center">
          {fetchedData.imageUrl ? (
            <img
              src={fetchedData.imageUrl}
              alt=""
              className="h-24 w-24 object-cover rounded-lg border border-slate-200 bg-slate-50"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://placehold.co/100x100/f1f5f9/64748b?text=Amazon+Item";
              }}
            />
          ) : (
            <div className="h-24 w-24 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400 font-bold">
              No Image
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                {fetchedData.merchant} • ASIN: {fetchedData.asin}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Affiliate Tag Added ✓
              </span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 mt-1 line-clamp-1">{fetchedData.title}</h4>
            <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{fetchedData.description}</p>
            
            <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
              <span className="text-slate-950 text-base font-black">₹{fetchedData.price}</span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePublishNow}
                  disabled={saving}
                  className="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Publishing to Site...
                    </>
                  ) : (
                    "🚀 1-Click Publish to LinkMarket"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
