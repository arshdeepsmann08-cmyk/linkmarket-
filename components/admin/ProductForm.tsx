"use client";

import { useState } from "react";

type Category = { id: string; name: string };
type ProductValue = {
  id?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  productUrl?: string;
  affiliateUrl?: string;
  price?: { toString(): string } | string | number;
  currency?: string;
  categoryId?: string;
  brand?: string | null;
  rating?: number;
  availability?: string;
  merchant?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  source?: string;
  sourceProductId?: string | null;
};

export function ProductForm({ categories, product }: { categories: Category[]; product?: ProductValue }) {
  const editing = Boolean(product?.id);

  // Form State
  const [amazonUrl, setAmazonUrl] = useState("");
  const [loadingAmazon, setLoadingAmazon] = useState(false);
  const [amazonStatus, setAmazonStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [title, setTitle] = useState(product?.title || "");
  const [description, setDescription] = useState(product?.description || "");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || "");
  const [productUrl, setProductUrl] = useState(product?.productUrl || "");
  const [affiliateUrl, setAffiliateUrl] = useState(product?.affiliateUrl || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [currency, setCurrency] = useState(product?.currency || "INR");
  const [brand, setBrand] = useState(product?.brand || "");
  const [merchant, setMerchant] = useState(product?.merchant || "Amazon India");
  const [rating, setRating] = useState(product?.rating ?? 4.5);
  const [availability, setAvailability] = useState(product?.availability || "In stock");
  const [source, setSource] = useState(product?.source || "MANUAL");
  const [sourceProductId, setSourceProductId] = useState(product?.sourceProductId || "");

  // Auto-fetch Amazon Product Details
  const handleFetchAmazon = async () => {
    if (!amazonUrl.trim()) {
      setAmazonStatus({ type: "error", message: "Please enter an Amazon product URL or ASIN first." });
      return;
    }

    setLoadingAmazon(true);
    setAmazonStatus(null);

    try {
      const res = await fetch("/api/admin/amazon-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: amazonUrl }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Could not fetch product details from Amazon.");
      }

      const data = json.data;

      // Auto populate form fields
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.imageUrl) setImageUrl(data.imageUrl);
      if (data.productUrl) setProductUrl(data.productUrl);
      if (data.affiliateUrl) setAffiliateUrl(data.affiliateUrl);
      if (data.price) setPrice(data.price.toString());
      if (data.currency) setCurrency(data.currency);
      if (data.brand) setBrand(data.brand);
      if (data.merchant) setMerchant(data.merchant);
      if (data.rating) setRating(data.rating);
      if (data.availability) setAvailability(data.availability);

      setSource("AMAZON");
      setSourceProductId(data.asin);

      setAmazonStatus({
        type: "success",
        message: data.hasPaApi
          ? `Successfully imported "${data.title.slice(0, 40)}..." via Amazon PA API!`
          : `Imported "${data.title.slice(0, 40)}..." from Amazon metadata! Review the fields below before saving.`,
      });
    } catch (err: any) {
      setAmazonStatus({
        type: "error",
        message: err?.message || "Failed to fetch Amazon product. Check the URL and try again.",
      });
    } finally {
      setLoadingAmazon(false);
    }
  };

  return (
    <form action={editing ? `/api/admin/products/${product?.id}` : "/api/admin/products"} method="post" className="card mt-6 space-y-5 p-5 sm:p-7">
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="sourceProductId" value={sourceProductId} />

      {/* Amazon Quick Import Card */}
      <section className="rounded-2xl border border-amber-300 bg-amber-50/80 p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-black text-amber-950 text-base flex items-center gap-2">
              <span className="text-xl">⚡</span> Auto-Fill from Amazon
            </h2>
            <p className="mt-0.5 text-xs text-amber-900/80">
              Paste an Amazon URL or ASIN (e.g., <code>B08N5WRWNW</code>) to auto-fill title, image, price & affiliate link.
            </p>
          </div>
          {source === "AMAZON" && sourceProductId && (
            <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-2.5 py-1 rounded-full">
              ASIN: {sourceProductId}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <input
            className="field flex-1 text-sm bg-white"
            type="url"
            name="amazonProductUrl"
            placeholder="https://www.amazon.in/dp/B08N5WRWNW"
            value={amazonUrl}
            onChange={(e) => setAmazonUrl(e.target.value)}
          />
          <button
            type="button"
            onClick={handleFetchAmazon}
            disabled={loadingAmazon}
            className="btn bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 whitespace-nowrap transition-colors cursor-pointer"
          >
            {loadingAmazon ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Fetching from Amazon...
              </>
            ) : (
              "✨ Auto-Fill Fields"
            )}
          </button>
        </div>

        {amazonStatus && (
          <div
            className={`mt-3 p-3 rounded-xl text-xs font-bold ${
              amazonStatus.type === "success"
                ? "bg-emerald-100 border border-emerald-300 text-emerald-900"
                : "bg-red-100 border border-red-300 text-red-900"
            }`}
          >
            {amazonStatus.message}
          </div>
        )}
      </section>

      {/* Main Product Fields */}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-bold md:col-span-2">
          Product title
          <input
            className="field mt-1"
            name="title"
            required
            maxLength={120}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. boAt Airdopes 141 Bluetooth Wireless Earbuds"
          />
        </label>

        <label className="text-sm font-bold md:col-span-2">
          Description
          <textarea
            className="field mt-1 min-h-28"
            name="description"
            required
            maxLength={5000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key features, specifications, and recommendation highlights..."
          />
        </label>

        <label className="text-sm font-bold">
          Product image URL
          <input
            className="field mt-1"
            name="imageUrl"
            required
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://m.media-amazon.com/images/I/..."
          />
        </label>

        {/* Image Preview */}
        <div className="flex items-center gap-4">
          {imageUrl ? (
            <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-stone-200 bg-stone-50 flex-shrink-0">
              <img
                src={imageUrl}
                alt="Preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://placehold.co/200x200/f1f5f9/64748b?text=Invalid+Image";
                }}
              />
            </div>
          ) : (
            <div className="h-20 w-20 rounded-xl border border-dashed border-stone-300 bg-stone-50 flex items-center justify-center text-xs text-slate-400 font-bold flex-shrink-0">
              No image
            </div>
          )}
          <div className="text-xs text-slate-500">
            <p className="font-bold text-slate-700">Image Preview</p>
            <p className="mt-0.5">Amazon, Flipkart & direct image URLs are supported.</p>
          </div>
        </div>

        <label className="text-sm font-bold md:col-span-2">
          Merchant product page URL
          <input
            className="field mt-1"
            name="productUrl"
            required
            type="url"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            placeholder="https://www.amazon.in/dp/B08N5WRWNW"
          />
        </label>

        <label className="text-sm font-bold md:col-span-2">
          Affiliate URL (Outbound link with Associate Tag)
          <input
            className="field mt-1"
            name="affiliateUrl"
            required
            type="url"
            value={affiliateUrl}
            onChange={(e) => setAffiliateUrl(e.target.value)}
            placeholder="https://www.amazon.in/dp/B08N5WRWNW?tag=linkmarket-21"
          />
        </label>

        <label className="text-sm font-bold">
          Price (₹)
          <input
            className="field mt-1"
            name="price"
            required
            type="number"
            min="0.01"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="1499.00"
          />
        </label>

        <label className="text-sm font-bold">
          Currency
          <input
            className="field mt-1 uppercase"
            name="currency"
            required
            minLength={3}
            maxLength={3}
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            placeholder="INR"
          />
        </label>

        <label className="text-sm font-bold">
          Category
          <select className="field mt-1" name="categoryId" required defaultValue={product?.categoryId || categories[0]?.id}>
            {categories.map((category) => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
            {!categories.length && <option value="default-cat">Electronics</option>}
          </select>
        </label>

        <label className="text-sm font-bold">
          Brand
          <input
            className="field mt-1"
            name="brand"
            maxLength={120}
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g. boAt, Sony, Noise"
          />
        </label>

        <label className="text-sm font-bold">
          Rating (0 to 5)
          <input
            className="field mt-1"
            name="rating"
            required
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={rating}
            onChange={(e) => setRating(parseFloat(e.target.value) || 4.5)}
          />
        </label>

        <label className="text-sm font-bold">
          Availability
          <input
            className="field mt-1"
            name="availability"
            required
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            placeholder="In stock"
          />
        </label>

        <label className="text-sm font-bold md:col-span-2">
          Merchant Name
          <input
            className="field mt-1"
            name="merchant"
            required
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            placeholder="Amazon India"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-6 rounded-xl bg-stone-50 p-4 text-sm font-bold">
        <label className="flex items-center gap-2 cursor-pointer">
          <input name="isFeatured" type="checkbox" defaultChecked={product?.isFeatured !== false} /> Featured product on homepage
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input name="isActive" type="checkbox" defaultChecked={product ? product.isActive : true} /> Active and visible publicly
        </label>
      </div>

      <button className="btn btn-alt w-full sm:w-auto cursor-pointer" type="submit">
        {editing ? "SAVE PRODUCT CHANGES" : "ADD PRODUCT TO LINKMARKET"}
      </button>
    </form>
  );
}
