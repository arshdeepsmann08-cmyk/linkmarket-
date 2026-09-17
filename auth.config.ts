import type { NextAuthConfig } from "next-auth";

// Lightweight auth config used by Edge middleware (no Node.js-only imports like bcryptjs/prisma)
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminPage = nextUrl.pathname.startsWith("/admin");
      const isAccountPage =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/account");
      const isAuthPage =
        nextUrl.pathname === "/login" || nextUrl.pathname === "/signup";

      if (isAdminPage && auth?.user?.role !== "ADMIN") {
        return Response.redirect(new URL("/login", nextUrl));
      }
      if (isAccountPage && !isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
  },
  providers: [], // Providers are added in auth.ts (Node.js only)
};
