import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { productInputFromForm, uniqueProductSlug } from "@/lib/products";
import { productSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const contentType = req.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  try {
    let input: any;

    if (isJson) {
      const body = await req.json();

      let categoryId = body.categoryId;
      if (!categoryId) {
        const firstCat = await prisma.category.findFirst();
        if (firstCat) {
          categoryId = firstCat.id;
        } else {
          const newCat = await prisma.category.create({
            data: { name: "Electronics", slug: "electronics" },
          });
          categoryId = newCat.id;
        }
      }

      input = productSchema.parse({
        title: body.title,
        description: body.description || "Amazon product imported to LinkMarket.",
        imageUrl: body.imageUrl,
        productUrl: body.productUrl,
        affiliateUrl: body.affiliateUrl,
        price: Number(body.price),
        currency: (body.currency || "INR").toUpperCase(),
        categoryId,
        brand: body.brand || undefined,
        rating: Number(body.rating || 4.5),
        availability: body.availability || "In stock",
        merchant: body.merchant || "Amazon India",
        isFeatured: Boolean(body.isFeatured),
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        source: body.source || "AMAZON",
        sourceProductId: body.sourceProductId || body.asin || undefined,
      });
    } else {
      input = productInputFromForm(await req.formData());
    }

    // Ensure category exists
    let category = await prisma.category.findUnique({
      where: { id: input.categoryId },
      select: { id: true },
    });
    if (!category) {
      category = await prisma.category.findFirst({ select: { id: true } });
      if (!category) {
        category = await prisma.category.create({
          data: { name: "General", slug: "general" },
          select: { id: true },
        });
      }
      input.categoryId = category.id;
    }

    const slug = await uniqueProductSlug(input.title);
    const created = await prisma.product.create({
      data: { ...input, slug },
    });

    if (isJson) {
      return NextResponse.json({ success: true, product: created });
    }

    return NextResponse.redirect(new URL("/admin/products?created=1", req.url), 303);
  } catch (err: any) {
    console.error("Failed to create product:", err);
    if (isJson) {
      return NextResponse.json(
        { success: false, error: err?.message || "Failed to save product" },
        { status: 400 }
      );
    }
    return NextResponse.redirect(new URL("/admin/products/new?error=validation", req.url), 303);
  }
}
