"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

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
      <div className="hidden text-sm text-zinc-600 sm:block">{email}</div>
      <Button type="button" variant="secondary" onClick={signOut}>
        Sign out
      </Button>
    </div>
  );
}

