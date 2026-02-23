"use client";

import { Sparkles, BookOpen, Home, Settings, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const BRAND = "#3A63C2";
const BRAND_LIGHT = "#eef2fb";

function NavItem({ icon, label, href, active }: { icon: React.ReactNode; label: string; href: string; active?: boolean }) {
  return (
    <a
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors",
        active ? "font-semibold bg-[#eef2fb]" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 font-medium"
      )}
      style={active ? { color: BRAND } : undefined}
    >
      {icon}
      <span className="flex-1">{label}</span>
    </a>
  );
}

export default function HomePage() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8F9FC]">
      {/* Sidebar */}
      <aside className="flex h-full w-60 flex-col border-r border-zinc-100 bg-white shrink-0">
        <div className="flex items-center gap-2 px-4 py-4 border-b border-zinc-100">
          <span className="text-[15px] font-bold tracking-tight text-zinc-900">Saige</span>
        </div>

        <div className="px-3 pt-4 pb-3">
          <div className="flex rounded-xl p-1 gap-1" style={{ background: "#F1F5F9" }}>
            <a href="/ask" className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-medium text-zinc-500 hover:text-zinc-700 transition-all">
              <Sparkles className="size-3.5" />
              Ask
            </a>
            <a href="/learn" className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-medium text-zinc-500 hover:text-zinc-700 transition-all">
              <BookOpen className="size-3.5" />
              Learn
            </a>
          </div>
        </div>

        <div className="mx-3 h-px bg-zinc-100" />

        <nav className="px-3 pt-3 pb-2 space-y-0.5">
          <NavItem icon={<Home className="size-4" />} label="Home" href="/" active />
          <NavItem icon={<Sparkles className="size-4" />} label="Ask Saige" href="/ask" />
          <NavItem icon={<BookOpen className="size-4" />} label="Learn" href="/learn" />
        </nav>

        <div className="mt-auto border-t border-zinc-100 p-3 flex items-center gap-2.5">
          <div className="size-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-sm shrink-0" style={{ background: BRAND }}>
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-zinc-800 truncate">Your Account</p>
            <p className="text-[10px] text-zinc-400">Front Desk · Riverside Dental</p>
          </div>
          <Settings className="size-4 text-zinc-300 hover:text-zinc-600 cursor-pointer transition-colors shrink-0" />
        </div>
      </aside>

      {/* Main */}
      <main className="flex flex-1 flex-col items-center justify-center px-8">

        {/* Greeting */}
        <div className="mb-10 text-center">
          <p className="text-[13px] text-zinc-400 mb-1">{greeting}</p>
          <h1 className="text-[26px] font-bold tracking-tight text-zinc-900">What would you like to do?</h1>
        </div>

        {/* Two mode cards */}
        <div className="flex gap-5 w-full max-w-2xl">

          {/* Ask */}
          <a
            href="/ask"
            className="group flex-1 flex flex-col rounded-3xl border border-zinc-200 bg-white p-7 hover:shadow-lg hover:border-zinc-300 transition-all duration-200 cursor-pointer"
          >
            <div className="size-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: BRAND_LIGHT }}>
              <Sparkles className="size-6" style={{ color: BRAND }} />
            </div>
            <p className="text-[18px] font-bold text-zinc-900 mb-1.5">Ask Saige</p>
            <p className="text-[13px] text-zinc-400 leading-relaxed flex-1">
              Get an instant answer to any front-office question — with an exact script, step-by-step actions, and escalation guidance.
            </p>
            <div className="mt-6 flex items-center gap-1.5 text-[13px] font-semibold group-hover:gap-2.5 transition-all" style={{ color: BRAND }}>
              Ask a question <ArrowRight className="size-4" />
            </div>
          </a>

          {/* Learn */}
          <a
            href="/learn"
            className="group flex-1 flex flex-col rounded-3xl border border-zinc-200 bg-white p-7 hover:shadow-lg hover:border-zinc-300 transition-all duration-200 cursor-pointer"
          >
            <div className="size-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: "#f0fdf4" }}>
              <BookOpen className="size-6 text-emerald-600" />
            </div>
            <p className="text-[18px] font-bold text-zinc-900 mb-1.5">Learn</p>
            <p className="text-[13px] text-zinc-400 leading-relaxed flex-1">
              Complete your assigned training modules at your own pace and track your progress toward role readiness.
            </p>

            {/* Mini progress */}
            <div className="mt-5 space-y-2.5">
              {[
                { label: "Front Office Foundations", pct: 80 },
                { label: "Insurance & Billing Basics", pct: 40 },
                { label: "Patient Experience", pct: 20 },
              ].map(({ label, pct }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-zinc-500">{label}</span>
                    <span className="text-[10px] font-semibold text-zinc-400">{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-1.5 text-[13px] font-semibold text-emerald-600 group-hover:gap-2.5 transition-all">
              <CheckCircle2 className="size-4" />
              Continue learning <ArrowRight className="size-4 ml-auto" />
            </div>
          </a>
        </div>

      </main>
    </div>
  );
}
