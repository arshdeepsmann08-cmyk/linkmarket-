import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";
import { commissionSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  if (!(await getAdminUser())) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  try {
    await prisma.commission.create({ data: commissionSchema.parse(Object.fromEntries(await req.formData())) });
    return NextResponse.redirect(new URL("/admin?commission=recorded", req.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/admin?error=commission", req.url), 303);
  }
}
