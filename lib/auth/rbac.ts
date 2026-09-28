import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function getAdminUser() {
  const session = await auth();
  if (!session?.user) return null;

  if (session.user.role === "ADMIN") return session.user;

  // Direct DB check for immediate updates
  if (session.user.email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, email: true, name: true, role: true, image: true },
      });
      if (user?.role === "ADMIN") {
        session.user.role = "ADMIN";
        return session.user;
      }
      // If there are no admins registered yet, grant admin to this user
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount === 0 && user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
        });
        session.user.role = "ADMIN";
        return session.user;
      }
    } catch (e) {
      console.error("getAdminUser DB check error:", e);
    }
  }

  return session.user.role === "ADMIN" ? session.user : null;
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
  if (user.role === "ADMIN") return user;

  // Check database directly
  if (user.email) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true, role: true },
      });
      if (dbUser?.role === "ADMIN") {
        user.role = "ADMIN";
        return user;
      }

      // If no admin exists in DB yet, auto-promote first logged-in user
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount === 0) {
        await prisma.user.update({
          where: { email: user.email },
          data: { role: "ADMIN" },
        });
        user.role = "ADMIN";
        return user;
      }
    } catch (e) {
      console.error("requireAdmin db check error:", e);
    }
  }

  if (user.role !== "ADMIN") {
    redirect("/unauthorized");
  }
  return user;
}
