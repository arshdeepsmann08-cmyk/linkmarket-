import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { productInputFromForm, uniqueProductSlug } from "@/lib/products";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminUser())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const id = (await params).id;
  const formData = await req.formData();
  const intent = String(formData.get("intent") || "update");
  const product = await prisma.product.findUnique({ where: { id }, select: { id: true, isActive: true } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  try {
    if (intent === "toggle-active") {
      await prisma.product.update({ where: { id }, data: { isActive: !product.isActive } });
      return NextResponse.redirect(new URL("/admin/products?updated=1", req.url), 303);
    }
    const input = productInputFromForm(formData);
    const category = await prisma.category.findUnique({ where: { id: input.categoryId }, select: { id: true } });
    if (!category) throw new Error("Choose a valid category.");
    await prisma.product.update({ where: { id }, data: { ...input, slug: await uniqueProductSlug(input.title, id) } });
    return NextResponse.redirect(new URL("/admin/products?updated=1", req.url), 303);
  } catch {
    return NextResponse.redirect(new URL(`/admin/products/${id}/edit?error=validation`, req.url), 303);
  }
}
