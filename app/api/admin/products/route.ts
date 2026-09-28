import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { productInputFromForm, uniqueProductSlug } from "@/lib/products";

export async function POST(req: NextRequest) {
  if (!(await getAdminUser())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  try {
    const input = productInputFromForm(await req.formData());
    const category = await prisma.category.findUnique({ where: { id: input.categoryId }, select: { id: true } });
    if (!category) throw new Error("Choose a valid category.");
    await prisma.product.create({ data: { ...input, slug: await uniqueProductSlug(input.title) } });
    return NextResponse.redirect(new URL("/admin/products?created=1", req.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/admin/products/new?error=validation", req.url), 303);
  }
}
