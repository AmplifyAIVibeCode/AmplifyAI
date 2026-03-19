"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;

      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-950">Sign in</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Access your lead inbox and follow-ups.
        </p>
      </div>

      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-900">Email</label>
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@team.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-900">Password</label>
          <Input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Signing in…" : "Sign in"}
        </Button>

        <div className="pt-2 text-sm text-zinc-600">
          No account?{" "}
          <Link
            className="font-medium text-zinc-950 hover:underline"
            href="/signup"
          >
            Create one
          </Link>
          .
        </div>
      </form>
    </Card>
  );
}

