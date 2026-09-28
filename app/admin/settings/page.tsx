export default function Settings() {
  const amazonTag = process.env.AMAZON_AFFILIATE_TAG || "linkmarket-21";
  const hasPaKey = Boolean(process.env.AMAZON_PA_API_ACCESS_KEY);

  return (
    <section className="max-w-4xl">
      <h2 className="mt-6 text-3xl font-black">Admin Settings & Integrations</h2>
      <p className="mt-1 text-slate-600 text-sm">
        Configure your Amazon Associates affiliate tag, security settings, and legal disclosures to earn commissions.
      </p>

      <div className="mt-6 space-y-6">
        {/* Amazon Associates Setup Card */}
        <div className="card p-6 bg-gradient-to-br from-amber-50/90 to-amber-100/50 border border-amber-300">
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-amber-200/80 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-200 px-2.5 py-0.5 rounded-md">
                AFFILIATE REVENUE
              </span>
              <h3 className="text-xl font-black text-amber-950 mt-1">Amazon Associates Integration</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold bg-white px-3 py-1.5 rounded-full shadow-xs border border-amber-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Current Tag: <code className="text-amber-900">{amazonTag}</code>
            </div>
          </div>

          <div className="mt-5 space-y-4 text-sm text-amber-950">
            <h4 className="font-bold text-amber-950 text-base">How to set up Amazon Associates & Start Earning:</h4>

            <ol className="list-decimal pl-5 space-y-3 leading-relaxed">
              <li>
                <strong>Register for Amazon Associates India:</strong> Go to{" "}
                <a
                  href="https://associates.amazon.in"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline text-amber-900 hover:text-amber-950"
                >
                  associates.amazon.in
                </a>{" "}
                and sign up for a free affiliate account.
              </li>
              <li>
                <strong>Get your Associate Tracking ID:</strong> Once registered, copy your Store Tracking ID (e.g.{" "}
                <code>yourstore-21</code>).
              </li>
              <li>
                <strong>Configure Environment Variable:</strong> In your Vercel Dashboard (or <code>.env</code> file), set:
                <pre className="mt-2 bg-amber-950 text-amber-100 p-3 rounded-xl text-xs overflow-x-auto font-mono">
                  AMAZON_AFFILIATE_TAG="{amazonTag}"
                </pre>
              </li>
              <li>
                <strong>(Optional) Enable Amazon PA-API 5.0 Auto-Import:</strong> Once you make 3 qualifying sales on Amazon
                Associates, request PA API access from Amazon and add these to Vercel environment variables:
                <pre className="mt-2 bg-amber-950 text-amber-100 p-3 rounded-xl text-xs overflow-x-auto font-mono">
                  AMAZON_PA_API_ACCESS_KEY="YOUR_AWS_ACCESS_KEY"{"\n"}
                  AMAZON_PA_API_SECRET_KEY="YOUR_AWS_SECRET_KEY"
                </pre>
                <p className="mt-1 text-xs text-amber-900">
                  {hasPaKey
                    ? "✅ PA-API credentials detected! Products will be fetched using official Amazon API."
                    : "ℹ️ No PA-API key found. LinkMarket will automatically use server metadata fallback to import product details."}
                </p>
              </li>
            </ol>
          </div>
        </div>

        {/* Affiliate Redirect Safety Card */}
        <div className="card p-6 space-y-3">
          <h3 className="font-black text-lg">Affiliate Redirect & Host Safety</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Outbound affiliate clicks on LinkMarket are routed through <code>/go/[productId]</code> to ensure click tracking and prevent unauthorized redirects.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-700 space-y-1">
            <p className="font-bold">Allowed Merchant Hostnames (AFFILIATE_ALLOWED_HOSTS):</p>
            <code className="block bg-white p-2.5 rounded-lg border border-slate-200 text-slate-900 font-mono">
              www.amazon.in, amazon.in, www.amazon.com, amazon.com, dl.flipkart.com, www.flipkart.com, flipkart.com
            </code>
          </div>
        </div>

        {/* Required Compliance & Disclosures Card */}
        <div className="card p-6 space-y-3">
          <h3 className="font-black text-lg">Amazon Associates Operating Compliance</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Amazon requires all affiliate websites to clearly present the official disclosure notice. LinkMarket displays this disclosure automatically in the site footer and on the <code>/affiliate-disclosure</code> page.
          </p>
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs font-bold text-emerald-950">
            "As an Amazon Associate I earn from qualifying purchases."
          </div>
        </div>
      </div>
    </section>
  );
}
