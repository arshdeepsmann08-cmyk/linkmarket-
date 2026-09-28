import crypto from "crypto";

const AMAZON_HOST = /(^|\.)amazon\.[a-z.]+$/i;
const ASIN_REGEX = /\/(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})(?:[/?]|$)/i;
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

  if (DIRECT_ASIN.test(trimmed)) {
    const asin = trimmed.toUpperCase();
    return {
      asin,
      url: `https://www.amazon.in/dp/${asin}`,
      host: "www.amazon.in",
    };
  }

  try {
    const url = new URL(trimmed);
    if (!AMAZON_HOST.test(url.hostname)) return null;
    const match = url.pathname.match(ASIN_REGEX);
    if (!match || !DIRECT_ASIN.test(match[1])) return null;
    const asin = match[1].toUpperCase();
    return {
      asin,
      url: `https://${url.hostname}/dp/${asin}`,
      host: url.hostname,
    };
  } catch {
    return null;
  }
}

/** Builds an Amazon affiliate link tagged with the associate tag. */
export function buildAmazonAffiliateUrl(asin: string, host = "www.amazon.in", tag?: string) {
  const affiliateTag = tag || process.env.AMAZON_AFFILIATE_TAG || "linkmarket-21";
  const cleanHost = host.includes("amazon") ? host : "www.amazon.in";
  return `https://${cleanHost}/dp/${asin}?tag=${encodeURIComponent(affiliateTag)}`;
}

/**
 * Fetches product metadata from Amazon URL or ASIN.
 * Uses Amazon PA-API 5.0 if AWS credentials are configured,
 * otherwise parses OpenGraph / JSON-LD / HTML meta tags server-side.
 */
export async function fetchAmazonProductData(inputUrl: string): Promise<AmazonProductInfo> {
  const parsed = parseAmazonProductUrl(inputUrl);
  if (!parsed) {
    throw new Error("Invalid Amazon product URL or ASIN. Please check the URL.");
  }

  const { asin, url, host } = parsed;
  const affiliateTag = process.env.AMAZON_AFFILIATE_TAG || "linkmarket-21";
  const affiliateUrl = buildAmazonAffiliateUrl(asin, host, affiliateTag);
  const isIndia = host.includes(".in");
  const currency = isIndia ? "INR" : "USD";
  const merchant = isIndia ? "Amazon India" : "Amazon";

  const paAccessKey = process.env.AMAZON_PA_API_ACCESS_KEY;
  const paSecretKey = process.env.AMAZON_PA_API_SECRET_KEY;

  if (paAccessKey && paSecretKey) {
    try {
      const paData = await fetchPaApiData(asin, host, paAccessKey, paSecretKey, affiliateTag);
      if (paData) return { ...paData, hasPaApi: true };
    } catch (e) {
      console.warn("PA-API lookup failed, falling back to metadata fetch:", e);
    }
  }

  // Fallback: Fetch product page and extract OpenGraph / JSON-LD metadata
  const scraped = await scrapeAmazonMetadata(url, asin);

  return {
    asin,
    title: scraped.title || `Amazon Product (${asin})`,
    description: scraped.description || `Buy ${scraped.title || asin} on ${merchant} with fast shipping and best price.`,
    imageUrl: scraped.imageUrl || `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop`,
    productUrl: url,
    affiliateUrl,
    price: scraped.price || 999,
    currency: scraped.currency || currency,
    brand: scraped.brand || "Generic",
    merchant,
    rating: scraped.rating || 4.5,
    availability: scraped.availability || "In stock",
    source: "AMAZON",
    hasPaApi: false,
  };
}

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

    // 1. Try JSON-LD parsing
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

    // 2. OpenGraph & Meta tag parsing
    const getMeta = (prop: string) => {
      const match =
        html.match(new RegExp(`<meta property="${prop}" content="([^"]+)"`, "i")) ||
        html.match(new RegExp(`<meta name="${prop}" content="([^"]+)"`, "i"));
      return match ? cleanString(match[1]) : undefined;
    };

    const title = getMeta("og:title") || extractTagText(html, "title");
    const description = getMeta("og:description") || getMeta("description");
    const imageUrl = getMeta("og:image");

    // Price extraction from common Amazon DOM elements
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

    // Brand extraction
    let brand: string | undefined;
    const brandMatch = html.match(/id="bylineInfo"[^>]*>Visit the ([^<]+) Store<\/a>/i) || html.match(/id="bylineInfo"[^>]*>Brand: ([^<]+)<\/a>/i);
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
