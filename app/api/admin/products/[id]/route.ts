import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { productInputFromForm, uniqueProductSlug } from "@/lib/products";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminUser())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const { id } = await params;
  const formData = await req.formData();
  const intent = String(formData.get("intent") || "update");

  try {
    if (intent === "delete") {
      await prisma.$transaction([
        prisma.click.deleteMany({ where: { productId: id } }),
        prisma.commission.deleteMany({ where: { productId: id } }),
        prisma.product.delete({ where: { id } }),
      ]);
      return NextResponse.redirect(new URL("/admin/products?deleted=1", req.url), 303);
    }

    const product = await prisma.product.findUnique({ where: { id }, select: { id: true, isActive: true } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    if (intent === "toggle-active") {
      await prisma.product.update({ where: { id }, data: { isActive: !product.isActive } });
      return NextResponse.redirect(new URL("/admin/products?updated=1", req.url), 303);
    }

    const input = productInputFromForm(formData);
    
    // Ensure category exists or fallback
    let category = await prisma.category.findUnique({ where: { id: input.categoryId }, select: { id: true } });
    if (!category) {
      category = await prisma.category.findFirst({ select: { id: true } });
      if (category) {
        input.categoryId = category.id;
      }
    }

    await prisma.product.update({
      where: { id },
      data: { ...input, slug: await uniqueProductSlug(input.title, id) },
    });
    return NextResponse.redirect(new URL("/admin/products?updated=1", req.url), 303);
  } catch (err) {
    console.error("Failed to process product action:", err);
    return NextResponse.redirect(new URL(`/admin/products/${id}/edit?error=action_failed`, req.url), 303);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminUser())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  const { id } = await params;
  try {
    await prisma.$transaction([
      prisma.click.deleteMany({ where: { productId: id } }),
      prisma.commission.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);
    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (err: any) {
    console.error("Failed to delete product:", err);
    return NextResponse.json({ error: err?.message || "Failed to delete product" }, { status: 500 });
  }
}

