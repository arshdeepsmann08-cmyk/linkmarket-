import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function getAdminUser() {
  const session = await auth();
  return session?.user?.role === "ADMIN" ? session.user : null;
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    redirect("/unauthorized");
  }
  return user;
}
