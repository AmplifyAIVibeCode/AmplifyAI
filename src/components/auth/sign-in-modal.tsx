"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import Link from "next/link";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export function SignInModal({ isOpen, onClose, redirectTo = "/app" }: SignInModalProps) {
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

      onClose();
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Sign in">
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-zinc-600">
            Access your lead inbox and follow-ups.
          </p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-900">Email</label>
            <Input
              type="email"
              autoComplete="email"
              placeholder="you@team.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
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
              className="h-11"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          <Button type="submit" disabled={isLoading} className="h-11">
            {isLoading ? "Signing in…" : "Sign in"}
          </Button>

          <div className="pt-2 text-sm text-zinc-600 text-center">
            No account?{" "}
            <Link
              className="font-medium text-zinc-950 hover:underline"
              href="/signup"
              onClick={handleClose}
            >
              Create one
            </Link>
            .
          </div>
        </form>
      </div>
    </Modal>
  );
}