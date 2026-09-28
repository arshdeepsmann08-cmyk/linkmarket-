import Link from "next/link";

const links = [
  ["Dashboard", "/admin"], ["Products", "/admin/products"], ["Add Product", "/admin/products/new"],
  ["Categories", "/admin/categories"], ["Affiliate Links", "/admin/affiliate-links"], ["Analytics", "/admin/analytics"], ["Settings", "/admin/settings"],
];

export function AdminNav() {
  return <nav className="flex gap-2 overflow-x-auto border-b border-stone-200 pb-4 text-sm font-bold">
    {links.map(([label, href]) => <Link key={href} href={href} className="shrink-0 rounded-full bg-white px-4 py-2 shadow-sm hover:bg-mint/20">{label}</Link>)}
  </nav>;
}
