import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

function deviceFrom(userAgent: string | null) {
  if (!userAgent) return "unknown";
  if (/tablet|ipad/i.test(userAgent)) return "tablet";
  if (/mobi|android/i.test(userAgent)) return "mobile";
  return "desktop";
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const product = await prisma.product.findFirst({ where: { id: (await params).productId, isActive: true } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  let destination: URL;
  try { destination = new URL(product.affiliateUrl); if (!['http:', 'https:'].includes(destination.protocol)) throw new Error(); }
  catch { return NextResponse.json({ error: "Unsafe affiliate URL" }, { status: 400 }); }
  const allowed = process.env.AFFILIATE_ALLOWED_HOSTS?.split(",").map(host => host.trim()).filter(Boolean);
  if (allowed?.length && !allowed.includes(destination.hostname)) return NextResponse.json({ error: "Affiliate host not allowed" }, { status: 400 });
  const session = await getSession();
  const ref = req.nextUrl.searchParams.get("ref");
  const referrerUserId = ref && await prisma.user.findUnique({ where: { id: ref }, select: { id: true } }) ? ref : null;
  const sessionId = req.cookies.get("linkmarket_sid")?.value || crypto.randomUUID();
  const userAgent = req.headers.get("user-agent");
  await prisma.click.create({ data: { productId: product.id, userId: session?.id, referrerUserId, sessionId, merchant: product.merchant, device: deviceFrom(userAgent), referrer: req.headers.get("referer")?.slice(0, 500), userAgent: userAgent?.slice(0, 500) } });
  const response = NextResponse.redirect(destination);
  response.cookies.set("linkmarket_sid", sessionId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30, path: "/" });
  return response;
}
