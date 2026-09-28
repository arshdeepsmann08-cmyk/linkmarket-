import { requireAdmin } from "@/lib/auth/rbac";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="shell py-8">
      <p className="font-bold text-mint">ADMIN CONSOLE</p>
      <h1 className="mb-5 text-3xl font-black sm:text-4xl">LinkMarket operations</h1>
      <AdminNav />
      {children}
    </div>
  );
}
