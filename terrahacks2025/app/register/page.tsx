"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignInService } from "@/service/SignInService";

function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
      <path d="M12 5c-5 0-8.5 3.5-10 7 1.5 3.5 5 7 10 7s8.5-3.5 10-7c-1.5-3.5-5-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
    </svg>
  );
}
function EyeOffIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
      <path d="M3 3l18 18-1.5 1.5-2.6-2.6A12.7 12.7 0 0 1 12 19c-5 0-8.5-3.5-10-7a13.8 13.8 0 0 1 4.2-5.2L1.5 4.5 3 3Zm6.9 6.9a2.8 2.8 0 0 0-.4 1.4 2.5 2.5 0 0 0 2.5 2.5c.5 0 1-.1 1.4-.4l-3.5-3.5Zm8.1 6.6-2.1-2.1A5 5 0 0 1 7.6 9.1l-1.7-1.7A12.3 12.3 0 0 1 12 5c5 0 8.5 3.5 10 7-.8 1.9-2.3 3.9-4 5.5Z" />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await SignInService.userSignUp(email, password);
      setOk(true);
      // router.replace("/dashboard");
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
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            required
            placeholder="Create a password"
            className="border rounded p-2 w-full pr-10"
            value={password}
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-2 my-auto p-1"
            onClick={() => setShowPw(v => !v)}
            onMouseDown={e => e.preventDefault()}
            aria-label={showPw ? "Hide password" : "Show password"}
            aria-pressed={showPw}
            title={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>

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
