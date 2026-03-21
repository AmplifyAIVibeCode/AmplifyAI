import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f3f1ec]">
      {/* ── Gradient blobs ── */}
      <div
        className="pointer-events-none absolute -bottom-32 -left-24 h-[480px] w-[480px] rounded-full opacity-60 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, rgba(147,220,236,0.7) 0%, rgba(147,220,236,0) 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 right-0 h-[420px] w-[420px] rounded-full opacity-60 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, rgba(120,100,255,0.65) 0%, rgba(120,100,255,0) 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-10 left-1/3 h-[360px] w-[360px] rounded-full opacity-40 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, rgba(180,230,200,0.7) 0%, rgba(180,230,200,0) 70%)",
        }}
      />

      {/* ── Subtle grid overlay ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Content ── */}
      <main className="relative z-10 flex flex-col items-center px-6 py-24 text-center">
        {/* Logo / Brand */}
        <div className="mb-10 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-950">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-zinc-900">
            Amplify AI
          </span>
        </div>

        {/* Headline */}
        <h1 className="max-w-2xl text-balance text-5xl font-semibold leading-[1.1] tracking-tight text-zinc-950 sm:text-6xl">
          Close more deals.
          <br />
          Let AI handle the follow-up.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-lg text-pretty text-base leading-7 text-zinc-500">
          Amplify AI helps real estate agents upload leads, analyze intent,
          score opportunities, and generate the perfect follow-up message —
          all in one place.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-950 px-7 text-sm font-medium text-white shadow-lg shadow-zinc-950/20 transition-all hover:scale-[1.02] hover:bg-zinc-800 active:scale-[0.98]"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-200/80 bg-white/60 px-7 text-sm font-medium text-zinc-700 backdrop-blur-sm transition-all hover:bg-white hover:text-zinc-950"
          >
            Sign in
          </Link>
        </div>

        {/* Feature pills */}
        <div className="mt-16 flex flex-wrap justify-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-zinc-200/60 bg-white/50 px-4 py-2 text-sm backdrop-blur-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px]">
              📥
            </span>
            <span className="font-medium text-zinc-800">Upload leads</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-zinc-200/60 bg-white/50 px-4 py-2 text-sm backdrop-blur-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px]">
              🧠
            </span>
            <span className="font-medium text-zinc-800">AI analysis</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-zinc-200/60 bg-white/50 px-4 py-2 text-sm backdrop-blur-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[10px]">
              🔥
            </span>
            <span className="font-medium text-zinc-800">Lead scoring</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-zinc-200/60 bg-white/50 px-4 py-2 text-sm backdrop-blur-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-[10px]">
              ✨
            </span>
            <span className="font-medium text-zinc-800">Smart follow-ups</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-zinc-200/60 bg-white/50 px-4 py-2 text-sm backdrop-blur-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-[10px]">
              📊
            </span>
            <span className="font-medium text-zinc-800">Opportunity dashboard</span>
          </div>
        </div>
      </main>
    </div>
  );
}
