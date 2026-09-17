"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password.");
        setLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setOauthLoading(true);
    await signIn("google", { callbackUrl });
  }

  return (
    <div className="shell max-w-md py-14">
      <h1 className="text-3xl font-black">Welcome back</h1>
      <p className="mt-1 text-sm muted">Sign in to your LinkMarket account</p>

      {registered && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          Account created successfully! Please sign in below.
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="card mt-6 space-y-4 p-6">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={oauthLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-sm transition shadow-sm cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z" />
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.42l4.04-3.15z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
          </svg>
          <span>{oauthLoading ? "Connecting to Google..." : "Continue with Google"}</span>
        </button>

        <div className="relative my-4 flex items-center justify-center">
          <div className="border-t border-stone-200 w-full" />
          <span className="bg-white px-2 text-xs uppercase tracking-wider text-stone-400 font-semibold absolute">
            or email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-semibold">
            Email
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field mt-1 w-full"
              placeholder="you@example.com"
            />
          </label>
          <label className="block text-sm font-semibold">
            Password
            <input
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field mt-1 w-full"
              placeholder="••••••••"
            />
          </label>
          <button type="submit" disabled={loading} className="btn w-full cursor-pointer disabled:opacity-50">
            {loading ? "Signing in..." : "Log in"}
          </button>
        </form>
      </div>

      <p className="mt-4 text-sm">
        New here?{" "}
        <Link className="font-bold text-mint" href="/signup">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="shell max-w-md py-14"><p className="muted">Loading…</p></div>}>
      <LoginForm />
    </Suspense>
  );
}
