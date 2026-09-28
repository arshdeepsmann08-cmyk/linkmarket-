import { z } from "zod";

const httpUrl = z.string().url().refine((value) => /^https?:\/\//i.test(value), "Only HTTP(S) URLs are allowed");

export const credentialsSchema = z.object({
  name: z.string().min(2).max(80).optional(), email: z.string().email(), password: z.string().min(8).max(100),
});

export const productSchema = z.object({
  title: z.string().trim().min(2).max(120), description: z.string().trim().min(10).max(5000),
  imageUrl: httpUrl, productUrl: httpUrl, affiliateUrl: httpUrl,
  price: z.coerce.number().positive().max(9_999_999), currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/),
  categoryId: z.string().min(1), brand: z.string().trim().max(120).optional().transform((value) => value || undefined),
  rating: z.coerce.number().min(0).max(5), availability: z.string().trim().min(2).max(80), merchant: z.string().trim().min(2).max(80),
  isFeatured: z.boolean().default(false), isActive: z.boolean().default(true),
  source: z.enum(["MANUAL", "AMAZON", "FLIPKART"]).default("MANUAL"), sourceProductId: z.string().trim().max(100).optional().transform((value) => value || undefined),
});

export const commissionSchema = z.object({
  productId: z.string().min(1), orderReference: z.string().min(3).max(120), amount: z.coerce.number().positive(), status: z.enum(["PENDING", "CONFIRMED", "REJECTED", "PAID"]),
});

export const categorySchema = z.object({ name: z.string().trim().min(2).max(80) });
