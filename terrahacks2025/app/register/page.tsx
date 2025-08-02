"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignInService } from "@/service/SignInService";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await SignInService.userSignUp(email, password);
      // If email confirmations are ON, user may need to verify email.
      setOk(true);
      // Option A: go straight to dashboard if confirmations are OFF
      // router.replace("/dashboard");
      // Option B: send them to login
      // router.replace("/login?registered=1");
    } catch (e: any) {
      setErr(e?.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Create account</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <input
          type="email"
          required
          placeholder="you@example.com"
          className="border rounded p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          required
          placeholder="Create a password"
          className="border rounded p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button disabled={loading} className="rounded p-2 border">
          {loading ? "Creating..." : "Sign up"}
        </button>
        {err && <p className="text-red-600 text-sm">{err}</p>}
        {ok && (
          <p className="text-green-700 text-sm">
            Account created. Check your email if verification is required.
          </p>
        )}
      </form>

      <p className="text-sm mt-3">
        Already have an account? <a className="underline" href="/login">Sign in</a>
      </p>
    </div>
  );
}
