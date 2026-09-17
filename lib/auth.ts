import { auth } from "@/auth";

export type Session = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};

export async function getSession(): Promise<Session | null> {
  const session = await auth();
  if (!session?.user) return null;
  return {
    id: session.user.id,
    name: session.user.name || "",
    email: session.user.email || "",
    role: (session.user.role as "USER" | "ADMIN") || "USER",
  };
}

export { requireUser, requireAdmin } from "./auth/rbac";
