import { prisma } from "@/lib/prisma";
import { parseAmazonProductUrl } from "@/lib/amazon";
import { parseFlipkartProductUrl } from "@/lib/flipkart";
import { productSchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";

export function productInputFromForm(formData: FormData) {
  const amazonUrl = String(formData.get("amazonProductUrl") || "").trim();
  const amazon = amazonUrl ? parseAmazonProductUrl(amazonUrl) : null;
  if (amazonUrl && !amazon) throw new Error("Enter a valid Amazon product URL containing an ASIN.");

  const flipkartUrl = String(formData.get("flipkartProductUrl") || "").trim();
  const flipkart = flipkartUrl ? parseFlipkartProductUrl(flipkartUrl) : null;
  if (flipkartUrl && !flipkart) throw new Error("Enter a valid Flipkart product URL.");

  let source: "MANUAL" | "AMAZON" | "FLIPKART" = "MANUAL";
  let sourceProductId: string | undefined = undefined;
  let productUrl = formData.get("productUrl") as string;

  if (amazon) {
    source = "AMAZON";
    sourceProductId = amazon.asin;
    productUrl = amazon.url;
  } else if (flipkart) {
    source = "FLIPKART";
    sourceProductId = flipkart.productId;
    productUrl = flipkart.url;
  } else {
    source = (formData.get("source") as "MANUAL" | "AMAZON" | "FLIPKART") || "MANUAL";
    sourceProductId = (formData.get("sourceProductId") as string) || undefined;
  }

  return productSchema.parse({
    ...Object.fromEntries(formData),
    isFeatured: formData.get("isFeatured") === "on",
    isActive: formData.get("isActive") === "on",
    source,
    sourceProductId,
    productUrl,
  });
}

export async function uniqueProductSlug(title: string, excludeId?: string) {
  const base = slugify(title) || "product";
  let slug = base;
  let suffix = 1;
  while (true) {
    const found = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!found || found.id === excludeId) return slug;
    slug = `${base}-${suffix++}`;
  }
}
