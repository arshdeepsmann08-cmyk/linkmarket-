"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Error Boundary caught:", error);
  }, [error]);

  const isServerRenderError =
    !error?.message ||
    error.message.includes("Server Components render") ||
    error.message.includes("digest");

  return (
    <div className="card my-8 p-8 text-center max-w-xl mx-auto bg-stone-50 border-stone-300">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xl font-black">
        ⚠️
      </div>
      <h2 className="text-2xl font-black text-slate-900">Admin Portal Notice</h2>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed">
        {isServerRenderError
          ? "There was a temporary issue loading this section. You can retry loading or navigate to another administrative panel."
          : error.message}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={() => reset()} className="btn btn-alt cursor-pointer text-xs">
          ↻ Retry Loading
        </button>
        <Link href="/admin" className="btn cursor-pointer text-xs">
          Dashboard
        </Link>
        <Link href="/admin/products" className="btn cursor-pointer text-xs">
          View Products
        </Link>
      </div>
    </div>
  );
}

