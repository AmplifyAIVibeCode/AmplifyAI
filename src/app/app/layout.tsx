import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/app/user-menu";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-full flex-1 bg-zinc-50">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-6">
        <header className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-6">
            <Link className="text-sm font-semibold text-zinc-950" href="/app">
              Amplify AI
            </Link>
            <nav className="hidden items-center gap-4 text-sm sm:flex">
              <Link className="text-zinc-700 hover:text-zinc-950" href="/app">
                Dashboard
              </Link>
              <Link
                className="text-zinc-700 hover:text-zinc-950"
                href="/app/leads"
              >
                Leads
              </Link>
              <Link
                className="text-zinc-700 hover:text-zinc-950"
                href="/app/follow-ups"
              >
                Follow-ups
              </Link>
              <Link
                className="text-zinc-700 hover:text-zinc-950"
                href="/app/templates"
              >
                Templates
              </Link>
            </nav>
          </div>

          <UserMenu email={user?.email ?? null} />
        </header>

        <main className="flex flex-1 py-6">{children}</main>
      </div>
    </div>
  );
}

