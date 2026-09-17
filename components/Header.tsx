import Link from "next/link";
import { auth, signOut } from "@/auth";

export async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="border-b border-stone-200 bg-[#f8f7f2]/95 sticky top-0 z-50">
      <div className="shell flex min-h-16 items-center justify-between gap-4">
        <Link href="/" className="text-xl font-black tracking-tight">
          Link<span className="text-mint">Market</span>
        </Link>
        <nav className="hidden gap-5 text-sm font-semibold md:flex items-center">
          <Link href="/">Home</Link>
          <Link href="/explore">Explore</Link>
          <Link href="/explore">Categories</Link>
          {user && <Link href="/dashboard">Dashboard</Link>}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md font-bold text-xs border border-amber-300/60"
            >
              Admin Portal
            </Link>
          )}
        </nav>
        <div className="flex gap-2 text-sm font-bold items-center">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-600 hidden sm:inline-block font-medium">
                {user.email}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="btn px-4 py-2 text-xs cursor-pointer">
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <>
              <Link href="/login" className="px-3 py-2">
                Login
              </Link>
              <Link href="/signup" className="btn px-4 py-2">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
