"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { SettingsMenu } from "./settings-menu";

export function UserMenu({ email }: { email: string | null }) {
  const router = useRouter();

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-zinc-700">{email}</span>
      <Button
        variant="ghost"
        className="text-sm"
        onClick={() => router.push("/app?profile=open")}
      >
        Profile
      </Button>
      <SettingsMenu onSignOut={signOut} />
    </div>
  );
}

