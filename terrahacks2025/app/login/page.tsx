// app/login/page.tsx
"use client";

import { useState } from "react";
import { createSupabaseClient } from "@/supabase/client"; // or "../../supabase/client" if no tsconfig path alias

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // we'll add /auth/callback later; for now this can just return to the site root
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      {sent ? (
        <p>Check your email for a magic link.</p>
      ) : (
        <form onSubmit={handleSend} className="grid gap-3">
          <input
            type="email"
            required
            placeholder="you@example.com"
            className="border rounded p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="rounded p-2 border">Send magic link</button>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </form>
      )}
    </div>
  );
}
