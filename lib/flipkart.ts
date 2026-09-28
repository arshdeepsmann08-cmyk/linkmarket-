const FLIPKART_HOST = /(^|\.)flipkart\.com$/i;

/** Parses a Flipkart product URL to extract its product ID / item code without external scraping. */
export function parseFlipkartProductUrl(value: string) {
  try {
    const url = new URL(value.trim());
    if (!FLIPKART_HOST.test(url.hostname)) return null;

    const pid = url.searchParams.get("pid");
    if (pid && pid.trim().length >= 4) {
      return { productId: pid.trim().toUpperCase(), url: url.toString() };
    }

    const match = url.pathname.match(/\/p\/(itm[a-z0-9]+)/i);
    if (match) {
      return { productId: match[1].toUpperCase(), url: url.toString() };
    }

    if (url.pathname.includes("/p/")) {
      const parts = url.pathname.split("/p/");
      const slug = parts[0].split("/").filter(Boolean).pop();
      return { productId: (slug || "FLIPKART-ITEM").toUpperCase(), url: url.toString() };
    }

    return null;
  } catch {
    return null;
  }
}
