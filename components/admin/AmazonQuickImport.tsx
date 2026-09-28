"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AmazonQuickImport() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
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
      setSuccessMsg(
        `Fetched "${json.data.title.slice(0, 45)}..."! Review details below or edit before publishing.`
      );
    } catch (err: any) {
      setError(err?.message || "Could not fetch Amazon product. Please check the URL.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-5 bg-gradient-to-r from-amber-500/10 via-amber-100/50 to-amber-50 border-2 border-amber-400/80 rounded-2xl shadow-sm mb-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-black text-amber-950 text-lg flex items-center gap-2">
          <span>📦</span> Amazon 1-Click Product Importer
        </h3>
        <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
          Instant Auto-Fill
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
        />
        <button
          type="button"
          onClick={handleFetch}
          disabled={loading}
          className="btn bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-3 px-5 rounded-xl flex items-center justify-center gap-2 whitespace-nowrap transition-colors shadow-xs"
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
            "⚡ Auto-Fetch Product Details"
          )}
        </button>
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-xl bg-red-100 border border-red-300 text-red-900 text-xs font-bold">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mt-3 p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold">
          {successMsg}
        </div>
      )}

      {/* Preview Card when fetched */}
      {fetchedData && (
        <div className="mt-4 p-4 rounded-xl bg-white border border-amber-200 grid gap-4 sm:grid-cols-[80px_1fr] items-center">
          {fetchedData.imageUrl ? (
            <img src={fetchedData.imageUrl} alt="" className="h-20 w-20 object-cover rounded-lg border border-slate-200" />
          ) : (
            <div className="h-20 w-20 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400 font-bold">No Image</div>
          )}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              {fetchedData.merchant} • ASIN: {fetchedData.asin}
            </span>
            <h4 className="font-bold text-sm text-slate-900 mt-1 line-clamp-1">{fetchedData.title}</h4>
            <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{fetchedData.description}</p>
            <div className="mt-2 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-950 text-sm">₹{fetchedData.price}</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Affiliate Link Pre-Tagged ✅
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
