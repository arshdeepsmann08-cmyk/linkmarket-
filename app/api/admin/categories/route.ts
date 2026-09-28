import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validation";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  if (!(await getAdminUser())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  try {
    const form = await req.formData();
    const { name } = categorySchema.parse(Object.fromEntries(form));
    const id = String(form.get("id") || "");
    const slug = slugify(name);
    if (!slug) throw new Error("Invalid category");
    if (id) await prisma.category.update({ where: { id }, data: { name, slug } });
    else await prisma.category.create({ data: { name, slug } });
    return NextResponse.redirect(new URL("/admin/categories?updated=1", req.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/admin/categories?error=validation", req.url), 303);
  }
}
