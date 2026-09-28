import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/rbac";
import { fetchAmazonProductData } from "@/lib/amazon";

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Amazon product URL or ASIN is required." }, { status: 400 });
    }

    const productData = await fetchAmazonProductData(url);

    return NextResponse.json({
      success: true,
      data: productData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch Amazon product details." },
      { status: 400 }
    );
  }
}
