import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Please log in first at /login" }, { status: 401 });
  }

  const updatedUser = await prisma.user.update({
    where: { email: session.user.email },
    data: { role: "ADMIN" },
  });

  return NextResponse.redirect(new URL("/admin/products/new", req.url), 303);
}
