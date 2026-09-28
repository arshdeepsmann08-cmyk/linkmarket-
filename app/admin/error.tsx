"use client";

import { useEffect } from "react";

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

  return (
    <div className="card my-8 p-8 text-center max-w-xl mx-auto bg-stone-50 border-stone-300">
      <h2 className="text-2xl font-black text-slate-900">Admin Portal Notice</h2>
      <p className="mt-2 text-sm text-slate-600">
        {error?.message ? error.message : "Temporary issue loading admin content."}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={() => reset()} className="btn btn-alt cursor-pointer text-xs">
          Retry Action
        </button>
        <a href="/admin/products" className="btn cursor-pointer text-xs">
          View Products
        </a>
      </div>
    </div>
  );
}

