import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "2cc705d0cc8266453b4a7d9fd66f29ee7a2d524303f2ad721f484cba52f07c81",
  session: { strategy: "jwt" },
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

      // Require login for admin and account pages
      if ((isAdminPage || isAccountPage) && !isLoggedIn) {
        return Response.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`, nextUrl));
      }

      // If already logged in and visiting login/signup, redirect to dashboard
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  providers: [],
};
