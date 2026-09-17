import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import SessionProvider from "@/components/auth/SessionProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "LinkMarket | Discover products", template: "%s | LinkMarket" },
  description: "A transparent marketplace for product discovery and shareable affiliate links.",
  openGraph: {
    title: "LinkMarket",
    description: "Discover products. Share links. Earn commissions.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
