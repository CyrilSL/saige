"use client";

import { Sparkles } from "lucide-react";
import { SUGGESTED_PROMPTS } from "@/lib/chat-data";
import { cn } from "@/lib/utils";

const BRAND = "#3A63C2";
const BRAND_LIGHT = "#eef2fb";

interface ChatWelcomeProps {
    onPromptClick: (prompt: string) => void;
}

export function ChatWelcome({ onPromptClick }: ChatWelcomeProps) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center min-h-full">
            {/* Logo */}
            <div className="relative mb-6">
                <div
                    className="flex size-16 items-center justify-center rounded-2xl shadow-lg"
                    style={{ background: BRAND, boxShadow: `0 8px 24px rgba(58,99,194,0.25)` }}
                >
                    <Sparkles className="size-7 text-white" />
                </div>
                <div
                    className="absolute inset-0 rounded-2xl opacity-20 blur-xl scale-150"
                    style={{ background: BRAND }}
                />
            </div>

            <h1 className="mb-2 text-2xl font-bold tracking-tight text-zinc-900">
                How can I help your practice today?
            </h1>
            <p className="mb-10 max-w-sm text-[14px] text-zinc-500 leading-relaxed">
                I&apos;m Saige, your dental practice AI. Ask me about insurance billing,
                patient communication, scheduling, CDT coding, and more.
            </p>

            {/* Suggested prompts */}
            <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <button
                        key={i}
                        onClick={() => onPromptClick(prompt.description)}
                        className={cn(
                            "group flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-left",
                            "transition-all duration-200 hover:shadow-sm focus:outline-none focus-visible:ring-2"
                        )}
                        style={
                            {
                                "--tw-ring-color": BRAND,
                            } as React.CSSProperties
                        }
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = "#c5d3ee";
                            (e.currentTarget as HTMLElement).style.background = BRAND_LIGHT;
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = "#e4e4e7";
                            (e.currentTarget as HTMLElement).style.background = "#ffffff";
                        }}
                    >
                        <span className="text-2xl leading-none mt-0.5 shrink-0">{prompt.icon}</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-zinc-800 mb-0.5 group-hover:text-[#3A63C2] transition-colors">
                                {prompt.title}
                            </p>
                            <p className="text-[12px] text-zinc-500 leading-relaxed line-clamp-2">
                                {prompt.description}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
