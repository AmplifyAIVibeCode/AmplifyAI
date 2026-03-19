"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;

      // Supabase may require email confirmation depending on project settings.
      if (data.user && !data.session) {
        setInfo("Check your email to confirm your account, then sign in.");
        return;
      }

      router.push("/app");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign up.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-950">Create account</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Start tracking leads and automating replies.
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <div className="text-xs text-zinc-500">At least 8 characters.</div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {info ? (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
            {info}
          </div>
        ) : null}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating…" : "Create account"}
        </Button>

        <div className="pt-2 text-sm text-zinc-600">
          Already have an account?{" "}
          <Link className="font-medium text-zinc-950 hover:underline" href="/login">
            Sign in
          </Link>
          .
        </div>
      </form>
    </Card>
  );
}

