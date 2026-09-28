"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="shell py-20 text-center">
      <h1 className="text-3xl font-black">Something went wrong</h1>
      <p className="mt-3 muted">
        {error?.message && !error.message.toLowerCase().includes("prisma") && !error.message.toLowerCase().includes("database")
          ? error.message
          : "Please try again in a moment."}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={() => reset()} className="btn cursor-pointer">
          Try again
        </button>
        <a href="/" className="btn btn-alt">
          Go Home
        </a>
      </div>
    </div>
  );
}

