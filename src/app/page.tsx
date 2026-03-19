import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-zinc-50 to-white">
      <main className="w-full max-w-5xl px-6 py-20">
        <div className="rounded-3xl border border-zinc-200 bg-white p-10 shadow-sm">
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm text-zinc-700">
              MVP • Next.js + Supabase + GPT
            </div>

            <h1 className="text-balance text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
              Amplify AI helps real estate agents follow up automatically and
              re-engage cold leads.
            </h1>

            <p className="max-w-2xl text-pretty text-lg leading-8 text-zinc-600">
              Centralize every lead, message, and follow-up. For cold or lost
              leads, generate high-quality re-engagement messages with your
              preferred tone and templates—without exposing your OpenAI key to
              the browser.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-zinc-950 px-5 font-medium text-white hover:bg-zinc-800"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 font-medium text-zinc-950 hover:bg-zinc-50"
              >
                Sign in
              </Link>
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 p-4">
                <div className="text-sm font-medium text-zinc-950">
                  Lead inbox
                </div>
                <div className="text-sm text-zinc-600">
                  Track conversations per lead with hot/warm/cold status.
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200 p-4">
                <div className="text-sm font-medium text-zinc-950">
                  Follow-ups
                </div>
                <div className="text-sm text-zinc-600">
                  Schedule reminders and send messages when leads go quiet.
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200 p-4">
                <div className="text-sm font-medium text-zinc-950">
                  Re-engagement
                </div>
                <div className="text-sm text-zinc-600">
                  Identify inactivity windows and generate reactivation copy.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
