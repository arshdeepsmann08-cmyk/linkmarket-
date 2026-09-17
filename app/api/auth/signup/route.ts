// This route is now deprecated — registration is handled by /api/auth/register
// Kept as a redirect shim for backward compatibility.
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.redirect(new URL("/signup", process.env.NEXTAUTH_URL || "http://localhost:3000"));
}
