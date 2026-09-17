"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signup() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed.");
        setLoading(false);
      } else {
        router.push("/login?registered=true");
      }
    } catch {
      setError("Unable to connect to server. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="shell max-w-md py-14">
      <h1 className="text-3xl font-black">Join LinkMarket</h1>
      <p className="mt-1 text-sm muted">Create an account to start earning commissions</p>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card mt-6 space-y-4 p-6">
        <label className="block text-sm font-semibold">
          Name
          <input
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field mt-1 w-full"
            placeholder="Jane Doe"
          />
        </label>
        <label className="block text-sm font-semibold">
          Email
          <input
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field mt-1 w-full"
            placeholder="jane@example.com"
          />
        </label>
        <label className="block text-sm font-semibold">
          Password (min. 8 characters)
          <input
            name="password"
            type="password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field mt-1 w-full"
            placeholder="••••••••"
          />
        </label>
        <button type="submit" disabled={loading} className="btn w-full cursor-pointer disabled:opacity-50">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-sm">
        Already a member?{" "}
        <Link className="font-bold text-mint" href="/login">
          Log in
        </Link>
      </p>
    </div>
  );
}
