// This route is now deprecated — login is handled by NextAuth v5 via /api/auth/[...nextauth]
// Kept here as a redirect shim for backward compatibility with any existing form POST links.
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL || "http://localhost:3000"));
}
