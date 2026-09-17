import Link from "next/link";

export default function Unauthorized() {
  return (
    <div className="shell max-w-md py-16 text-center">
      <p className="text-rose-600 font-bold">403 FORBIDDEN</p>
      <h1 className="mt-2 text-4xl font-black">Access Restricted</h1>
      <p className="mt-4 text-slate-600">
        You do not have administrative permissions (ADMIN role) to view this page.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/dashboard" className="btn px-4 py-2">
          Go to Dashboard
        </Link>
        <Link href="/" className="px-4 py-2 border border-stone-300 rounded-xl font-bold text-sm bg-white">
          Home
        </Link>
      </div>
    </div>
  );
}
