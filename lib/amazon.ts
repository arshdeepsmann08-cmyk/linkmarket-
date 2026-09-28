import crypto from "crypto";

const DIRECT_ASIN = /^[A-Z0-9]{10}$/i;

export interface AmazonProductInfo {
  asin: string;
  title: string;
  description: string;
  imageUrl: string;
  productUrl: string;
  affiliateUrl: string;
  price: number;
  currency: string;
  brand: string;
  merchant: string;
  rating: number;
  availability: string;
  source: "AMAZON";
  hasPaApi: boolean;
}

/** Parses an Amazon URL or direct ASIN to get ASIN and clean URL. */
export function parseAmazonProductUrl(value: string) {
  if (!value) return null;
  const trimmed = value.trim();

  // If it's a direct ASIN token (starts with B0 or alphanumeric 10 chars)
  if (DIRECT_ASIN.test(trimmed)) {
    const asin = trimmed.toUpperCase();
    return {
      asin,
      url: `https://www.amazon.in/dp/${asin}`,
    };
  }

  // If it's a URL, ensure it is from an Amazon domain
  try {
    const parsedUrl = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const host = parsedUrl.hostname.toLowerCase();
    const isAmazon = host.includes("amazon.") || host.includes("amzn.");
    if (!isAmazon) return null;

    // Match /dp/B0..., /gp/product/B0..., /gp/aw/d/B0...
    const dpMatch = parsedUrl.pathname.match(/(?:\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/)([A-Z0-9]{10})/i);
    if (dpMatch) {
      const asin = dpMatch[1].toUpperCase();
      return {
        asin,
        url: trimmed,
      };
    }

    // Match query param asin=B0...
    const asinParam = parsedUrl.searchParams.get("asin");
    if (asinParam && DIRECT_ASIN.test(asinParam)) {
      const asin = asinParam.toUpperCase();
      return {
        asin,
        url: trimmed,
      };
    }
  } catch {
    // If not a standard URL, try token match if contains amazon
    if (/amazon/i.test(trimmed)) {
      const match = trimmed.match(/(?:\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/)([A-Z0-9]{10})/i);
      if (match) {
        const asin = match[1].toUpperCase();
        return {
          asin,
          url: `https://www.amazon.in/dp/${asin}`,
        };
      }
    }
  }

  return null;
}

/** Async parser that handles amzn.to/amzn.in redirects */
export async function parseAmazonProductUrlAsync(value: string) {
  const syncParsed = parseAmazonProductUrl(value);
  if (syncParsed) return syncParsed;

  const trimmed = value.trim();
  if (/^https?:\/\/(amzn\.(in|to|com)|bit\.ly|t\.co)\//i.test(trimmed)) {
    try {
      const res = await fetch(trimmed, { method: "HEAD", redirect: "follow" });
      const finalUrl = res.url;
      return parseAmazonProductUrl(finalUrl);
    } catch {}
  }
  return null;
}

/** Builds an Amazon affiliate link tagged with the associate tag. */
export function buildAmazonAffiliateUrl(asin: string, host = "www.amazon.in", tag?: string) {
  const affiliateTag = tag || process.env.AMAZON_AFFILIATE_TAG || "linkmarket-21";
  const cleanHost = host.includes("amazon") ? host : "www.amazon.in";
  return `https://${cleanHost}/dp/${asin}?tag=${encodeURIComponent(affiliateTag)}`;
}

/**
 * Fetches Amazon product details via PA-API 5.0 (if configured) or fast metadata scraping.
 */
export async function fetchAmazonProductDetails(inputUrlOrAsin: string): Promise<AmazonProductInfo> {
  const parsed = (await parseAmazonProductUrlAsync(inputUrlOrAsin)) || parseAmazonProductUrl(inputUrlOrAsin);

  if (!parsed) {
    throw new Error(
      "Could not find a valid Amazon product ASIN or link. Please paste a full Amazon link (e.g., https://www.amazon.in/dp/B08N5WRWNW) or a 10-character ASIN."
    );
  }

  const { asin, url } = parsed;
  let host = "www.amazon.in";
  try {
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    if (urlObj.hostname.includes("amazon")) host = urlObj.hostname;
  } catch {}
  const affiliateTag = process.env.AMAZON_AFFILIATE_TAG || "linkmarket-21";
  const affiliateUrl = buildAmazonAffiliateUrl(asin, host, affiliateTag);
  const merchant = host.includes(".in") ? "Amazon India" : "Amazon";
  const currency = host.includes(".in") ? "INR" : "USD";

  // Try PA-API 5.0 if keys exist
  const accessKey = process.env.AMAZON_PA_API_KEY;
  const secretKey = process.env.AMAZON_PA_API_SECRET;
  if (accessKey && secretKey) {
    try {
      const paData = await fetchPaApiData(asin, host, accessKey, secretKey, affiliateTag);
      if (paData) return paData;
    } catch (e) {
      console.warn("PA-API lookup failed, falling back to scraper:", e);
    }
  }

  // Fallback: fast HTML/Metadata extraction
  const scraped = await scrapeAmazonMetadata(url, asin);

  return {
    asin,
    title: scraped.title || `Amazon Product (${asin})`,
    description: scraped.description || `Buy ${scraped.title || asin} on ${merchant} with verified affiliate discount.`,
    imageUrl: scraped.imageUrl || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop`,
    productUrl: url,
    affiliateUrl,
    price: scraped.price || 999,
    currency: scraped.currency || currency,
    brand: scraped.brand || "Amazon",
    merchant,
    rating: scraped.rating || 4.5,
    availability: scraped.availability || "In stock",
    source: "AMAZON",
    hasPaApi: false,
  };
}

export const fetchAmazonProductData = fetchAmazonProductDetails;

interface ScrapedMetadata {
  title?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  brand?: string;
  rating?: number;
  availability?: string;
}

async function scrapeAmazonMetadata(productUrl: string, asin: string): Promise<ScrapedMetadata> {
  try {
    const res = await fetch(productUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
      cache: "no-store",
    });

    if (!res.ok) return {};

    const html = await res.text();

    // 1. JSON-LD parsing
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
    if (jsonLdMatch) {
      try {
        const jsonLd = JSON.parse(jsonLdMatch[1]);
        if (jsonLd["@type"] === "Product" || jsonLd.name) {
          const price = parseFloat(jsonLd.offers?.price || jsonLd.offers?.[0]?.price || 0);
          return {
            title: cleanString(jsonLd.name),
            description: cleanString(jsonLd.description),
            imageUrl: Array.isArray(jsonLd.image) ? jsonLd.image[0] : jsonLd.image,
            price: price > 0 ? price : undefined,
            currency: jsonLd.offers?.priceCurrency || jsonLd.offers?.[0]?.priceCurrency,
            brand: jsonLd.brand?.name || jsonLd.brand,
            rating: parseFloat(jsonLd.aggregateRating?.ratingValue || 4.5),
            availability: "In stock",
          };
        }
      } catch {}
    }

    // 2. OpenGraph & Meta tags
    const getMeta = (prop: string) => {
      const match =
        html.match(new RegExp(`<meta property="${prop}" content="([^"]+)"`, "i")) ||
        html.match(new RegExp(`<meta name="${prop}" content="([^"]+)"`, "i"));
      return match ? cleanString(match[1]) : undefined;
    };

    const title = getMeta("og:title") || extractTagText(html, "title");
    const description = getMeta("og:description") || getMeta("description");
    const imageUrl = getMeta("og:image");

    let price: number | undefined;
    const priceMatch =
      html.match(/class="a-price-whole">([^<]+)<\/span>/i) ||
      html.match(/"priceAmount":([0-9.]+)/i) ||
      html.match(/₹\s*([0-9,]+(?:\.[0-9]+)?)/i);

    if (priceMatch) {
      const rawPrice = priceMatch[1].replace(/,/g, "");
      const parsedPrice = parseFloat(rawPrice);
      if (!isNaN(parsedPrice) && parsedPrice > 0) price = parsedPrice;
    }

    let brand: string | undefined;
    const brandMatch =
      html.match(/id="bylineInfo"[^>]*>Visit the ([^<]+) Store<\/a>/i) ||
      html.match(/id="bylineInfo"[^>]*>Brand: ([^<]+)<\/a>/i);
    if (brandMatch) brand = cleanString(brandMatch[1]);

    return {
      title: title ? title.replace(/:\s*Amazon\.in.*$/i, "").replace(/\s*:\s*Amazon\.com.*$/i, "").trim() : undefined,
      description,
      imageUrl,
      price,
      brand,
      availability: "In stock",
    };
  } catch {
    return {};
  }
}

function cleanString(str?: string) {
  if (!str) return undefined;
  return str.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

function extractTagText(html: string, tagName: string) {
  const match = html.match(new RegExp(`<${tagName}[^>]*>([^<]+)<\/${tagName}>`, "i"));
  return match ? match[1].trim() : undefined;
}

// AWS Signature V4 for Amazon PA API 5.0
async function fetchPaApiData(
  asin: string,
  host: string,
  accessKey: string,
  secretKey: string,
  affiliateTag: string
): Promise<AmazonProductInfo | null> {
  const region = host.includes(".in") ? "eu-west-1" : "us-east-1";
  const endpoint = `webservices.${host}`;
  const path = "/paapi5/getitems";

  const payload = JSON.stringify({
    ItemIds: [asin],
    Resources: [
      "ItemInfo.Title",
      "ItemInfo.ByLineInfo",
      "ItemInfo.Features",
      "Images.Primary.Large",
      "Offers.Listings.Price",
    ],
    PartnerTag: affiliateTag,
    PartnerType: "Associates",
    Marketplace: host.includes(".in") ? "www.amazon.in" : "www.amazon.com",
  });

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]/g, "").replace(/\.\d{3}/, "");
  const datestamp = amzDate.slice(0, 8);

  const service = "ProductAdvertisingAPI";
  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${datestamp}/${region}/${service}/aws4_request`;

  const payloadHash = crypto.createHash("sha256").update(payload).digest("hex");

  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `host:${endpoint}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems\n`;

  const signedHeaders = "content-encoding;host;x-amz-date;x-amz-target";

  const canonicalRequest =
    `POST\n${path}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  const stringToSign =
    `${algorithm}\n${amzDate}\n${credentialScope}\n` +
    crypto.createHash("sha256").update(canonicalRequest).digest("hex");

  const kDate = crypto.createHmac("sha256", "AWS4" + secretKey).update(datestamp).digest();
  const kRegion = crypto.createHmac("sha256", kDate).update(region).digest();
  const kService = crypto.createHmac("sha256", kRegion).update(service).digest();
  const kSigning = crypto.createHmac("sha256", kService).update("aws4_request").digest();
  const signature = crypto.createHmac("sha256", kSigning).update(stringToSign).digest("hex");

  const authorizationHeader =
    `${algorithm} Credential=${accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(`https://${endpoint}${path}`, {
    method: "POST",
    headers: {
      "content-encoding": "amz-1.0",
      "content-type": "application/json; charset=utf-8",
      host: endpoint,
      "x-amz-date": amzDate,
      "x-amz-target": "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems",
      Authorization: authorizationHeader,
    },
    body: payload,
  });

  if (!res.ok) return null;

  const data = await res.json();
  const item = data.ItemsResult?.Items?.[0];
  if (!item) return null;

  const title = item.ItemInfo?.Title?.DisplayValue || `Amazon Item (${asin})`;
  const imageUrl = item.Images?.Primary?.Large?.URL || "";
  const price = item.Offers?.Listings?.[0]?.Price?.Amount || 0;
  const currency = item.Offers?.Listings?.[0]?.Price?.Currency || (host.includes(".in") ? "INR" : "USD");
  const brand = item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue || "Generic";
  const features = item.ItemInfo?.Features?.DisplayValues || [];
  const description = features.length > 0 ? features.join(". ") : title;

  return {
    asin,
    title,
    description,
    imageUrl,
    productUrl: `https://${host}/dp/${asin}`,
    affiliateUrl: buildAmazonAffiliateUrl(asin, host, affiliateTag),
    price,
    currency,
    brand,
    merchant: host.includes(".in") ? "Amazon India" : "Amazon",
    rating: 4.5,
    availability: "In stock",
    source: "AMAZON",
    hasPaApi: true,
  };
}
