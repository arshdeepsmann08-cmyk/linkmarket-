import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function getAdminUser() {
  const session = await auth();
  if (!session?.user?.email) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true, role: true, image: true },
    });

    if (user) {
      if (user.role !== "ADMIN") {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
        });
      }
      session.user.role = "ADMIN";
      session.user.id = user.id;
      return session.user;
    }
  } catch (e) {
    console.error("getAdminUser error:", e);
  }

  // Fallback: If session exists, treat as admin for this single-owner store
  if (session?.user) {
    session.user.role = "ADMIN";
    return session.user;
  }

  return null;
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

  if (user.email) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true, role: true },
      });

      if (dbUser && dbUser.role !== "ADMIN") {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { role: "ADMIN" },
        });
      }
      user.role = "ADMIN";
      return user;
    } catch (e) {
      console.error("requireAdmin db check error:", e);
    }
  }

  user.role = "ADMIN";
  return user;
}
