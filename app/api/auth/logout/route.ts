// Logout is now handled by NextAuth v5 signOut() server action in Header.tsx
// This shim redirects any legacy POST requests to the home page.
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  return NextResponse.redirect(new URL("/", req.url));
}
